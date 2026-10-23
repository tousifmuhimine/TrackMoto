import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
