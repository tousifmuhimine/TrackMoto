import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const dues = await prisma.customerDue.findMany({
      where: whereClause,
      include: {
        customer: true,
        bike: true,
        service: true,
        installments: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(dues);
  } catch (error: any) {
    console.error("Failed to fetch customer dues:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer dues", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      bikeModel,
      totalAmount,
      paidAmount = 0,
      dueDate,
      notes,
    } = body;

    const total = Number(totalAmount || 0);
    const paid = Number(paidAmount || 0);
    const remaining = Math.max(0, total - paid);

    let customerId = body.customerId;
    if (!customerId && customerName && customerPhone) {
      const existing = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      if (existing) {
        customerId = existing.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: { name: customerName, phone: customerPhone },
        });
        customerId = newCustomer.id;
      }
    }

    const due = await prisma.customerDue.create({
      data: {
        customerId: customerId || null,
        customerName: customerName || "Customer",
        bikeName: bikeModel || "Bike",
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: remaining <= 0 ? "CLEARED" : paid > 0 ? "PARTIAL" : "UNPAID",
        notes,
      },
    });

    if (paid > 0) {
      await prisma.installmentPayment.create({
        data: {
          customerDueId: due.id,
          amount: paid,
          method: "CASH",
          note: "Initial payment",
        },
      });
    }

    return NextResponse.json(due, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create customer due:", error);
    return NextResponse.json(
      { error: "Failed to create customer due", details: error.message },
      { status: 500 }
    );
  }
}
