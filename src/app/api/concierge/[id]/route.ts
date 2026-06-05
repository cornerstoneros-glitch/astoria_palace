import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/concierge/[id] - Update request status or descriptions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, description } = body;

    const requestExists = await prisma.conciergeRequest.findUnique({
      where: { id },
    });

    if (!requestExists) {
      return NextResponse.json(
        { status: "error", message: "Request not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    const updatedRequest = await prisma.conciergeRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ status: "success", data: updatedRequest });
  } catch (error: any) {
    console.error("PATCH /api/concierge/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update request" },
      { status: 500 }
    );
  }
}
