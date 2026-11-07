import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      todayServices,
      todayExpenses,
      todayInstallments,
      monthServices,
      monthExpenses,
      monthInstallments,
      allCustomerDues,
      recentServices,
      recentExpenses,
    ] = await Promise.all([
      prisma.service.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.expense.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.installmentPayment.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: {
          customerDue: {
            include: { customer: true },
          },
        },
      }),
      prisma.service.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.expense.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.installmentPayment.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        include: { customerDue: true },
      }),
      prisma.customerDue.findMany({
        where: { status: { not: "CLEARED" } },
      }),
      prisma.service.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: { customer: true, bike: true },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
    ]);

    // 1. Separate upfront payments from old due collections for TODAY
    const todayServiceIds = new Set(todayServices.map((s) => s.id));
    const todayOldDueCollections = todayInstallments.filter((inst) => {
      const isUpfrontSameDay =
        inst.note?.includes("Upfront payment") &&
        inst.customerDue?.serviceId &&
        todayServiceIds.has(inst.customerDue.serviceId);
      return !isUpfrontSameDay;
    });

    // Inflows by method (Today)
    const todayServiceCash = todayServices
      .filter((s) => s.paymentMethod === "CASH")
      .reduce((acc, s) => acc + (s.amountPaid || 0), 0);
    const todayOldDueCash = todayOldDueCollections
      .filter((i) => i.method === "CASH")
      .reduce((acc, i) => acc + (i.amount || 0), 0);
    const todayPhysicalCashIn = todayServiceCash + todayOldDueCash;

    const todayBkash =
      todayServices
        .filter((s) => s.paymentMethod === "BKASH")
        .reduce((acc, s) => acc + (s.amountPaid || 0), 0) +
      todayOldDueCollections
        .filter((i) => i.method === "BKASH")
        .reduce((acc, i) => acc + (i.amount || 0), 0);

    const todayNagad =
      todayServices
        .filter((s) => s.paymentMethod === "NAGAD")
        .reduce((acc, s) => acc + (s.amountPaid || 0), 0) +
      todayOldDueCollections
        .filter((i) => i.method === "NAGAD")
        .reduce((acc, i) => acc + (i.amount || 0), 0);

    const todayBank =
      todayServices
        .filter((s) => s.paymentMethod === "BANK")
        .reduce((acc, s) => acc + (s.amountPaid || 0), 0) +
      todayOldDueCollections
        .filter((i) => i.method === "BANK")
        .reduce((acc, i) => acc + (i.amount || 0), 0);

    const todayDigitalIn = todayBkash + todayNagad + todayBank;
    const todayTotalCashReceived = todayPhysicalCashIn + todayDigitalIn;

    // Expenses & Cash in Hand (Today)
    const todayExpense = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
    const todayCashInHand = todayPhysicalCashIn - todayExpense;

    // Revenue (Total work billed: Service + Parts + Oil + Extra) - Old due collections NEVER counted as revenue
    const todayRevenue = todayServices.reduce((acc, s) => acc + s.totalIncome, 0);
    const todayProfit = todayRevenue - todayExpense;

    // 2. Month calculations
    const monthServiceIds = new Set(monthServices.map((s) => s.id));
    const monthOldDueCollections = monthInstallments.filter((inst) => {
      const isUpfrontSameDay =
        inst.note?.includes("Upfront payment") &&
        inst.customerDue?.serviceId &&
        monthServiceIds.has(inst.customerDue.serviceId);
      return !isUpfrontSameDay;
    });

    const monthServiceCash = monthServices
      .filter((s) => s.paymentMethod === "CASH")
      .reduce((acc, s) => acc + (s.amountPaid || 0), 0);
    const monthOldDueCash = monthOldDueCollections
      .filter((i) => i.method === "CASH")
      .reduce((acc, i) => acc + (i.amount || 0), 0);
    const monthPhysicalCashIn = monthServiceCash + monthOldDueCash;

    const monthDigitalIn =
      monthServices
        .filter((s) => s.paymentMethod !== "CASH")
        .reduce((acc, s) => acc + (s.amountPaid || 0), 0) +
      monthOldDueCollections
        .filter((i) => i.method !== "CASH")
        .reduce((acc, i) => acc + (i.amount || 0), 0);

    const monthTotalCashReceived = monthPhysicalCashIn + monthDigitalIn;
    const monthExpense = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const monthRevenue = monthServices.reduce((acc, s) => acc + s.totalIncome, 0);
    const monthProfit = monthRevenue - monthExpense;

    // 3. Pending Customer Dues
    const pendingDuesTotal = allCustomerDues.reduce((acc, d) => acc + d.remainingAmount, 0);
    const pendingDuesCount = allCustomerDues.length;

    // 4. Last 7 Days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const [dayServices, dayExp] = await Promise.all([
        prisma.service.findMany({
          where: { date: { gte: dayStart, lte: dayEnd } },
        }),
        prisma.expense.findMany({
          where: { date: { gte: dayStart, lte: dayEnd } },
        }),
      ]);

      const rev = dayServices.reduce((acc, s) => acc + s.totalIncome, 0);
      const exp = dayExp.reduce((acc, e) => acc + e.amount, 0);

      last7Days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        income: rev,
        expense: exp,
        net: rev - exp,
      });
    }

    return NextResponse.json({
      today: {
        cashInHand: todayCashInHand,
        physicalCashIn: todayPhysicalCashIn,
        digitalIn: todayDigitalIn,
        totalCashReceived: todayTotalCashReceived,
        bkash: todayBkash,
        nagad: todayNagad,
        bank: todayBank,
        expense: todayExpense,
        revenue: todayRevenue,
        profit: todayProfit,
        serviceCount: todayServices.length,
        dueRecovered: todayOldDueCash + todayDigitalIn,
      },
      month: {
        totalCashReceived: monthTotalCashReceived,
        physicalCashIn: monthPhysicalCashIn,
        digitalIn: monthDigitalIn,
        expense: monthExpense,
        revenue: monthRevenue,
        profit: monthProfit,
        serviceCount: monthServices.length,
      },
      dues: {
        total: pendingDuesTotal,
        count: pendingDuesCount,
      },
      todayOldDueCollections: todayOldDueCollections.map((inst) => ({
        id: inst.id,
        amount: inst.amount,
        method: inst.method,
        date: inst.date,
        note: inst.note,
        customerName: inst.customerDue?.customerName || inst.customerDue?.customer?.name || "Customer",
        customerPhone: inst.customerDue?.customer?.phone || null,
        remainingAmount: inst.customerDue?.remainingAmount || 0,
      })),
      trend: last7Days,
      recentServices,
      recentExpenses,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data", details: error.message },
      { status: 500 }
    );
  }
}
