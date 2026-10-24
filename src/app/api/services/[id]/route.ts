import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const serviceCharge = parseFloat(body.serviceCharge || 0);
    const sparePartsCost = parseFloat(body.sparePartsCost || 0);
    const engineOilCost = parseFloat(body.engineOilCost || 0);
    const extraCharges = parseFloat(body.extraCharges || 0);
    const totalIncome = serviceCharge + sparePartsCost + engineOilCost + extraCharges;
    const amountPaid = parseFloat(body.amountPaid || 0);
    const runningKm = body.runningKm ? parseInt(body.runningKm, 10) : null;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        serviceCharge,
        sparePartsCost,
        engineOilCost,
        extraCharges,
        totalIncome,
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
        amountPaid: body.paymentStatus === "PAID" ? totalIncome : amountPaid,
        notes: body.notes,
        saleType: body.saleType || "SERVICE",
        runningKm,
        ...(body.date ? { date: new Date(body.date) } : {}),
      },
      include: {
        customer: true,
        bike: true,
      },
    });

    // Update bike's runningKm if provided
    if (updated.bikeId && runningKm) {
      await prisma.bike.update({
        where: { id: updated.bikeId },
        data: { runningKm },
      });
    }

    // Sync linked customerDue if exists
    const existingDue = await prisma.customerDue.findFirst({
      where: { serviceId: id },
    });

    if (existingDue) {
      if (body.paymentStatus === "PAID") {
        await prisma.customerDue.update({
          where: { id: existingDue.id },
          data: {
            paidAmount: totalIncome,
            remainingAmount: 0,
            status: "CLEARED",
          },
        });
      } else {
        const remaining = Math.max(0, totalIncome - amountPaid);
        await prisma.customerDue.update({
          where: { id: existingDue.id },
          data: {
            totalAmount: totalIncome,
            paidAmount: amountPaid,
            remainingAmount: remaining,
            status: remaining <= 0 ? "CLEARED" : amountPaid > 0 ? "PARTIAL" : "UNPAID",
          },
        });
      }
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update service", details: error.message },
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
    await prisma.service.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Service deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete service", details: error.message },
      { status: 500 }
    );
  }
}
