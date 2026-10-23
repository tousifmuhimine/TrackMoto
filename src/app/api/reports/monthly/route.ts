import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get("year") || new Date().getFullYear().toString();
    const year = parseInt(yearStr, 10);

    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const [services, expenses] = await Promise.all([
      prisma.service.findMany({
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      }),
    ]);

    // Aggregate by month (0-11)
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyData = monthNames.map((name, index) => {
      const monthServices = services.filter(
        (s) => new Date(s.date).getMonth() === index
      );
      const monthExpenses = expenses.filter(
        (e) => new Date(e.date).getMonth() === index
      );

      const totalIncome = monthServices.reduce((sum, s) => sum + s.totalIncome, 0);
      const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netTotal = totalIncome - totalExpense;

      const serviceChargeTotal = monthServices.reduce((sum, s) => sum + s.serviceCharge, 0);
      const sparePartsTotal = monthServices.reduce((sum, s) => sum + s.sparePartsCost, 0);
      const engineOilTotal = monthServices.reduce((sum, s) => sum + s.engineOilCost, 0);
      const extraTotal = monthServices.reduce((sum, s) => sum + s.extraCharges, 0);

      let status = "NO ACTIVITY";
      if (netTotal > 0) {
        status = "PROFIT";
      } else if (netTotal < 0) {
        status = "LOSS";
      } else if (totalIncome > 0 || totalExpense > 0) {
        status = "BREAK-EVEN";
      } else {
        status = "NO ACTIVITY";
      }

      return {
        monthIndex: index + 1,
        monthName: name,
        year,
        serviceCount: monthServices.length,
        expenseCount: monthExpenses.length,
        serviceChargeTotal,
        sparePartsTotal,
        engineOilTotal,
        extraTotal,
        totalIncome,
        totalExpense,
        netTotal,
        status,
      };
    });

    const yearlyIncome = monthlyData.reduce((sum, m) => sum + m.totalIncome, 0);
    const yearlyExpense = monthlyData.reduce((sum, m) => sum + m.totalExpense, 0);
    const yearlyNet = yearlyIncome - yearlyExpense;

    return NextResponse.json({
      year,
      yearlyIncome,
      yearlyExpense,
      yearlyNet,
      months: monthlyData,
    });
  } catch (error: any) {
    console.error("Failed to compute monthly report:", error);
    return NextResponse.json(
      { error: "Failed to compute monthly report", details: error.message },
      { status: 500 }
    );
  }
}
