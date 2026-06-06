import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/rooms/[id] - Update room status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { number, status, cleaningStatus, roomTypeId, siteId } = body;

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id },
    });

    if (!roomExists) {
      return NextResponse.json(
        { status: "error", message: "Room not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (number !== undefined) updateData.number = number;
    if (status !== undefined) updateData.status = status;
    if (cleaningStatus !== undefined) updateData.cleaningStatus = cleaningStatus;
    if (roomTypeId !== undefined) updateData.roomTypeId = roomTypeId;
    if (siteId !== undefined) updateData.siteId = siteId;

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        roomType: true,
        site: true,
      },
    });

    return NextResponse.json({ status: "success", data: updatedRoom });
  } catch (error: any) {
    console.error("PATCH /api/rooms/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete a room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id },
    });

    if (!roomExists) {
      return NextResponse.json(
        { status: "error", message: "Room not found" },
        { status: 404 }
      );
    }

    // Check if there are active reservations linked to this room
    const linkedReservations = await prisma.reservation.count({
      where: {
        roomId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (linkedReservations > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Cannot delete room with active or pending reservations",
        },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "Room successfully deleted",
    });
  } catch (error: any) {
    console.error("DELETE /api/rooms/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete room" },
      { status: 500 }
    );
  }
}
