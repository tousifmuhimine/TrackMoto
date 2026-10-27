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
      const parts = dateStr.split("T")[0].split("-").map(Number);
      const startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));

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

    let expenseDate = new Date();
    if (date) {
      if (typeof date === "string" && date.includes("-")) {
        const parts = date.split("T")[0].split("-").map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          expenseDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
        } else {
          expenseDate = new Date(date);
        }
      } else {
        expenseDate = new Date(date);
      }
    }

    const expense = await prisma.expense.create({
      data: {
        date: expenseDate,
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
