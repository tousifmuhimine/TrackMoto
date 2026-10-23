import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customerDue.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Customer due record deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete customer due", details: error.message },
      { status: 500 }
    );
  }
}
