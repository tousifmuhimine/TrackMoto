import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bikes: true,
        services: true,
        customerDues: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = customers.map((c) => {
      const totalSpent = c.services.reduce((acc, s) => acc + s.totalIncome, 0);
      const pendingDues = c.customerDues
        .filter((d) => d.status !== "CLEARED")
        .reduce((acc, d) => acc + d.remainingAmount, 0);

      return {
        ...c,
        totalSpent,
        pendingDues,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, tag = "NEW", bikeModel, bikeReg, runningKm } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const km = runningKm ? parseInt(runningKm, 10) : null;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        address,
        tag,
        bikes: bikeModel
          ? {
              create: {
                model: bikeModel,
                registrationNo: bikeReg || null,
                runningKm: km,
              },
            }
          : undefined,
      },
      include: {
        bikes: true,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create customer", details: error.message },
      { status: 500 }
    );
  }
}
