import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let expenseDate: Date | undefined = undefined;
    if (body.date) {
      if (typeof body.date === "string" && body.date.includes("-")) {
        const parts = body.date.split("T")[0].split("-").map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          expenseDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
        } else {
          expenseDate = new Date(body.date);
        }
      } else {
        expenseDate = new Date(body.date);
      }
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        description: body.description,
        amount: parseFloat(body.amount || 0),
        category: body.category || "MISC",
        ...(expenseDate ? { date: expenseDate } : {}),
      },
    });

    return NextResponse.json({ success: true, expense: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update expense", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expense.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete expense", details: error.message },
      { status: 500 }
    );
  }
}
