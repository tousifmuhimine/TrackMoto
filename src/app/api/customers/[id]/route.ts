import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address || null,
        tag: body.tag || "REGULAR",
      },
      include: {
        bikes: true,
      },
    });

    // If bike info provided, update first bike or create
    if (body.bikeModel) {
      const runningKm = body.runningKm ? parseInt(body.runningKm, 10) : null;
      if (updated.bikes && updated.bikes.length > 0) {
        await prisma.bike.update({
          where: { id: updated.bikes[0].id },
          data: {
            model: body.bikeModel,
            registrationNo: body.bikeReg || null,
            runningKm,
          },
        });
      } else {
        await prisma.bike.create({
          data: {
            customerId: id,
            model: body.bikeModel,
            registrationNo: body.bikeReg || null,
            runningKm,
          },
        });
      }
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update customer", details: error.message },
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
    await prisma.customer.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete customer", details: error.message },
      { status: 500 }
    );
  }
}
