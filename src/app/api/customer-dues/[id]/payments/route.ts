import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, method = "CASH", transactionId, note, date } = body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    const due = await prisma.customerDue.findUnique({
      where: { id },
    });

    if (!due) {
      return NextResponse.json({ error: "Due record not found" }, { status: 404 });
    }

    const newPaidAmount = due.paidAmount + paymentAmount;
    const newRemainingAmount = Math.max(0, due.totalAmount - newPaidAmount);
    const newStatus =
      newRemainingAmount <= 0
        ? "CLEARED"
        : newPaidAmount > 0
        ? "PARTIAL"
        : "UNPAID";

    // 1. Record installment
    const installment = await prisma.installmentPayment.create({
      data: {
        customerDueId: id,
        amount: paymentAmount,
        method,
        transactionId: transactionId || null,
        note: note || "Installment payment",
        date: date ? new Date(date) : new Date(),
      },
    });

    // 2. Update parent due record
    const updatedDue = await prisma.customerDue.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      },
      include: {
        installments: {
          orderBy: { date: "desc" },
        },
        customer: true,
        bike: true,
        service: true,
      },
    });

    return NextResponse.json({ installment, due: updatedDue });
  } catch (error: any) {
    console.error("Failed to record installment payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment", details: error.message },
      { status: 500 }
    );
  }
}
