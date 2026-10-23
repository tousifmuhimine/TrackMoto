import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, quantity, buyPrice, sellPrice, reorderLevel, supplierName } = body;

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category: category || "PARTS",
        quantity: Number(quantity || 0),
        buyPrice: Number(buyPrice || 0),
        sellPrice: Number(sellPrice || 0),
        reorderLevel: Number(reorderLevel || 5),
        supplierName,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
