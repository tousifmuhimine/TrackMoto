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
      monthServices,
      monthExpenses,
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
      prisma.service.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.expense.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
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

    // Today calculations
    const todayIncome = todayServices.reduce((acc, s) => acc + s.totalIncome, 0);
    const todayExpense = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
    const todayNet = todayIncome - todayExpense;

    // Monthly calculations
    const monthIncome = monthServices.reduce((acc, s) => acc + s.totalIncome, 0);
    const monthExpense = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const monthNet = monthIncome - monthExpense;

    // Pending dues
    const pendingDuesTotal = allCustomerDues.reduce((acc, d) => acc + d.remainingAmount, 0);
    const pendingDuesCount = allCustomerDues.length;

    // Last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayServices = await prisma.service.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
      });
      const dayExp = await prisma.expense.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
      });

      const inc = dayServices.reduce((acc, s) => acc + s.totalIncome, 0);
      const exp = dayExp.reduce((acc, e) => acc + e.amount, 0);

      last7Days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }

    return NextResponse.json({
      today: {
        income: todayIncome,
        expense: todayExpense,
        net: todayNet,
        serviceCount: todayServices.length,
      },
      month: {
        income: monthIncome,
        expense: monthExpense,
        net: monthNet,
        serviceCount: monthServices.length,
      },
      dues: {
        total: pendingDuesTotal,
        count: pendingDuesCount,
      },
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
