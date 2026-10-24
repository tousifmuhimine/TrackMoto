import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        quantity: parseInt(body.quantity, 10),
        buyPrice: parseFloat(body.buyPrice || 0),
        sellPrice: parseFloat(body.sellPrice || 0),
        reorderLevel: body.reorderLevel ? parseInt(body.reorderLevel, 10) : 5,
        supplierName: body.supplierName || null,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update inventory item", details: error.message },
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
    await prisma.inventoryItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Inventory item deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete inventory item", details: error.message },
      { status: 500 }
    );
  }
}
