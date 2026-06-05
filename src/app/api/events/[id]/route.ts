import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// PATCH /api/events/[id] - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, eventDate, price, image, isActive } = body;

    const eventExists = await prisma.hotelEvent.findUnique({
      where: { id },
    });

    if (!eventExists) {
      return NextResponse.json(
        { status: "error", message: "Événement introuvable" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = !!isActive;

    const updatedEvent = await prisma.hotelEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ status: "success", data: updatedEvent });
  } catch (error: any) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const eventExists = await prisma.hotelEvent.findUnique({
      where: { id },
    });

    if (!eventExists) {
      return NextResponse.json(
        { status: "error", message: "Événement introuvable" },
        { status: 404 }
      );
    }

    await prisma.hotelEvent.delete({
      where: { id },
    });

    return NextResponse.json({ status: "success", message: "Événement supprimé avec succès" });
  } catch (error: any) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
