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

    const entry = await prisma.dueEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Due entry not found" }, { status: 404 });
    }

    const newPaidAmount = entry.paidAmount + paymentAmount;
    const newRemainingAmount = Math.max(0, entry.totalAmount - newPaidAmount);
    const newStatus =
      newRemainingAmount <= 0
        ? "CLEARED"
        : newPaidAmount > 0
        ? "PARTIAL"
        : "UNPAID";

    const payment = await prisma.duePayment.create({
      data: {
        dueEntryId: id,
        amount: paymentAmount,
        method,
        transactionId: transactionId || null,
        note: note || "Payment",
        date: date ? new Date(date) : new Date(),
      },
    });

    const updatedEntry = await prisma.dueEntry.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      },
      include: {
        party: true,
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json({ payment, entry: updatedEntry });
  } catch (error: any) {
    console.error("Failed to record due payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment", details: error.message },
      { status: 500 }
    );
  }
}
