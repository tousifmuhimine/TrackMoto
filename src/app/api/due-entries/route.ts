import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const direction = searchParams.get("direction"); // RECEIVABLE or PAYABLE

    let whereClause: any = {};
    if (direction && (direction === "RECEIVABLE" || direction === "PAYABLE")) {
      whereClause.direction = direction;
    }

    const entries = await prisma.dueEntry.findMany({
      where: whereClause,
      include: {
        party: true,
        payments: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also compute net balances for all parties
    const parties = await prisma.dueParty.findMany({
      include: {
        dueEntries: true,
      },
    });

    const partySummary = parties.map((p) => {
      const receivable = p.dueEntries
        .filter((e) => e.direction === "RECEIVABLE")
        .reduce((sum, e) => sum + e.remainingAmount, 0);

      const payable = p.dueEntries
        .filter((e) => e.direction === "PAYABLE")
        .reduce((sum, e) => sum + e.remainingAmount, 0);

      const net = receivable - payable; // positive means they owe us, negative means we owe them

      return {
        party: p,
        totalReceivable: receivable,
        totalPayable: payable,
        netBalance: net,
      };
    });

    return NextResponse.json({ entries, partySummary });
  } catch (error: any) {
    console.error("Failed to fetch due entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch due entries", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      partyName,
      partyPhone,
      partyType = "OTHER",
      direction, // RECEIVABLE or PAYABLE
      reason,
      totalAmount,
      paidAmount = 0,
      dueDate,
    } = body;

    if (!partyName || !direction || !totalAmount) {
      return NextResponse.json(
        { error: "Party name, direction, and total amount are required" },
        { status: 400 }
      );
    }

    // 1. Find or create party
    let party = await prisma.dueParty.findFirst({
      where: { name: partyName },
    });

    if (!party) {
      party = await prisma.dueParty.create({
        data: {
          name: partyName,
          phone: partyPhone || null,
          type: partyType,
        },
      });
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount || 0);
    const remaining = Math.max(0, total - paid);

    // 2. Create due entry
    const entry = await prisma.dueEntry.create({
      data: {
        partyId: party.id,
        direction,
        reason: reason || "Due entry",
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: remaining <= 0 ? "CLEARED" : paid > 0 ? "PARTIAL" : "UNPAID",
      },
      include: {
        party: true,
      },
    });

    if (paid > 0) {
      await prisma.duePayment.create({
        data: {
          dueEntryId: entry.id,
          amount: paid,
          note: "Initial payment",
        },
      });
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create due entry:", error);
    return NextResponse.json(
      { error: "Failed to create due entry", details: error.message },
      { status: 500 }
    );
  }
}
