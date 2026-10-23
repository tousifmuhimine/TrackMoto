import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
