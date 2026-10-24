import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.dueEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const totalAmount = body.totalAmount ? parseFloat(body.totalAmount) : existing.totalAmount;
    const paidAmount = existing.paidAmount;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const updated = await prisma.dueEntry.update({
      where: { id },
      data: {
        reason: body.reason || existing.reason,
        direction: body.direction || existing.direction,
        totalAmount,
        remainingAmount,
        status: remainingAmount <= 0 ? "CLEARED" : paidAmount > 0 ? "PARTIAL" : "UNPAID",
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      },
      include: {
        party: true,
        payments: true,
      },
    });

    return NextResponse.json({ success: true, dueEntry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update due entry", details: error.message },
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
    await prisma.dueEntry.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Due entry deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete due entry", details: error.message },
      { status: 500 }
    );
  }
}
