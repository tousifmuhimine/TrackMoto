import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    let whereClause: any = {};
    if (dateStr) {
      const parts = dateStr.split("T")[0].split("-").map(Number);
      const startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const payments = await prisma.installmentPayment.findMany({
      where: whereClause,
      include: {
        customerDue: {
          include: {
            customer: true,
            bike: true,
            service: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("Failed to fetch installment payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch installment payments", details: error.message },
      { status: 500 }
    );
  }
}
