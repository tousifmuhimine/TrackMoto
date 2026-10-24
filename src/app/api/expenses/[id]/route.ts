import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        description: body.description,
        amount: parseFloat(body.amount || 0),
        category: body.category || "MISC",
        ...(body.date ? { date: new Date(body.date) } : {}),
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
