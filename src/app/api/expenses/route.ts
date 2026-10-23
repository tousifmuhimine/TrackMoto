import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause: any = {};

    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, description, amount, category = "MISC" } = body;

    if (!description || !amount) {
      return NextResponse.json(
        { error: "Description and amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description,
        amount: Number(amount),
        category,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense", details: error.message },
      { status: 500 }
    );
  }
}
