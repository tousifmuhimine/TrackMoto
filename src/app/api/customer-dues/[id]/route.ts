import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.customerDue.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const totalAmount = body.totalAmount ? parseFloat(body.totalAmount) : existing.totalAmount;
    const paidAmount = existing.paidAmount;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const updated = await prisma.customerDue.update({
      where: { id },
      data: {
        totalAmount,
        remainingAmount,
        status: remainingAmount <= 0 ? "CLEARED" : paidAmount > 0 ? "PARTIAL" : "UNPAID",
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
      include: {
        customer: true,
        bike: true,
        installments: true,
      },
    });

    return NextResponse.json({ success: true, customerDue: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update customer due", details: error.message },
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
    await prisma.customerDue.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Customer due record deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete customer due", details: error.message },
      { status: 500 }
    );
  }
}
