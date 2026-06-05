import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/halls/bookings/[id] - Update event booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { status: "error", message: "Missing required field: status" },
        { status: 400 }
      );
    }

    const booking = await prisma.hallBooking.findUnique({
      where: { id },
      include: { hall: true },
    });

    if (!booking) {
      return NextResponse.json(
        { status: "error", message: "Event booking not found" },
        { status: 404 }
      );
    }

    const updatedBooking = await prisma.hallBooking.update({
      where: { id },
      data: { status },
      include: { hall: true },
    });

    // Integrated logic: If marked as CONFIRMED, automatically log as a PAYMENT transaction in Accounting ledger under category EVENTS
    if (status === "CONFIRMED") {
      await prisma.transaction.create({
        data: {
          amount: booking.totalPrice,
          type: "PAYMENT",
          status: "PAID",
          description: `Location Salle — ${booking.hall.name} pour ${booking.clientName}`,
          category: "EVENTS",
        },
      });
    }

    return NextResponse.json({ status: "success", data: updatedBooking });
  } catch (error: any) {
    console.error("PATCH /api/halls/bookings/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update event booking" },
      { status: 500 }
    );
  }
}
