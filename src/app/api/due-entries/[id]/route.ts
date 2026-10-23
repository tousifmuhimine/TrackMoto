import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dueEntry.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Due entry deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete due entry", details: error.message },
      { status: 500 }
    );
  }
}
