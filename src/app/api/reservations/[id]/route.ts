import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations/[id] - Fetch a single reservation
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true,
            site: true,
          },
        },
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        kycData: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { status: "error", message: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", data: reservation });
  } catch (error: any) {
    console.error("GET /api/reservations/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

// PATCH /api/reservations/[id] - Update reservation status or dates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { checkIn, checkOut, roomId, status, checkInStatus } = body;

    // 1. Fetch current reservation
    const currentRes = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    if (!currentRes) {
      return NextResponse.json(
        { status: "error", message: "Reservation not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    let shouldRecalculatePrice = false;
    let targetRoomId = currentRes.roomId;

    if (roomId !== undefined && roomId !== currentRes.roomId) {
      targetRoomId = roomId;
      updateData.roomId = roomId;
      shouldRecalculatePrice = true;
    }

    const finalCheckIn = checkIn ? new Date(checkIn) : currentRes.checkIn;
    const finalCheckOut = checkOut ? new Date(checkOut) : currentRes.checkOut;

    if (checkIn !== undefined || checkOut !== undefined) {
      if (finalCheckIn >= finalCheckOut) {
        return NextResponse.json(
          { status: "error", message: "Check-in date must be before check-out date" },
          { status: 400 }
        );
      }
      updateData.checkIn = finalCheckIn;
      updateData.checkOut = finalCheckOut;
      shouldRecalculatePrice = true;
    }

    if (status !== undefined) updateData.status = status;
    if (checkInStatus !== undefined) updateData.checkInStatus = checkInStatus;

    // 2. Overlap / double-booking check if dates or room changed
    if (shouldRecalculatePrice) {
      const bookingConflict = await prisma.reservation.findFirst({
        where: {
          roomId: targetRoomId,
          status: { in: ["PENDING", "CONFIRMED"] },
          NOT: {
            id, // Exclude this reservation itself
          },
          AND: [
            {
              NOT: {
                OR: [
                  { checkOut: { lte: finalCheckIn } },
                  { checkIn: { gte: finalCheckOut } },
                ],
              },
            },
          ],
        },
      });

      if (bookingConflict) {
        return NextResponse.json(
          {
            status: "error",
            message: "Overlapping reservation exists for the selected room and dates",
          },
          { status: 409 }
        );
      }

      // Fetch the target room's type pricing
      const targetRoom = await prisma.room.findUnique({
        where: { id: targetRoomId },
        include: { roomType: true },
      });

      if (!targetRoom) {
        return NextResponse.json(
          { status: "error", message: "Selected room does not exist" },
          { status: 404 }
        );
      }

      // Recalculate price
      const diffTime = Math.abs(finalCheckOut.getTime() - finalCheckIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updateData.totalPrice = diffDays * targetRoom.roomType.price;
    }

    // Update DB record
    const updatedRes = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Sync transaction in the ledger
    try {
      const existingTx = await prisma.transaction.findFirst({
        where: {
          description: {
            contains: `[ID: ${id}]`,
          },
        },
      });

      const finalPrice = updatedRes.totalPrice;
      const isPaid = updatedRes.status === "CONFIRMED" || updatedRes.status === "COMPLETED";
      const isCancelled = updatedRes.status === "CANCELLED";

      if (existingTx) {
        await prisma.transaction.update({
          where: { id: existingTx.id },
          data: {
            amount: finalPrice,
            type: isPaid ? "PAYMENT" : "INVOICE",
            status: isCancelled ? "CANCELLED" : (isPaid ? "PAID" : "PENDING"),
            description: `${isPaid ? 'Paiement' : (isCancelled ? 'Facture Annulée' : 'Facture')} Réservation Chambre ${updatedRes.room.number} (${updatedRes.room.roomType.name}) - Client: ${updatedRes.client.name || updatedRes.client.email} [ID: ${updatedRes.id}]`,
          },
        });
      } else {
        await prisma.transaction.create({
          data: {
            amount: finalPrice,
            type: isPaid ? "PAYMENT" : "INVOICE",
            status: isCancelled ? "CANCELLED" : (isPaid ? "PAID" : "PENDING"),
            description: `${isPaid ? 'Paiement' : (isCancelled ? 'Facture Annulée' : 'Facture')} Réservation Chambre ${updatedRes.room.number} (${updatedRes.room.roomType.name}) - Client: ${updatedRes.client.name || updatedRes.client.email} [ID: ${updatedRes.id}]`,
            userId: updatedRes.clientId,
            category: "RESERVATION",
          },
        });
      }
    } catch (txError) {
      console.error("Failed to sync reservation transaction:", txError);
    }

    return NextResponse.json({ status: "success", data: updatedRes });
  } catch (error: any) {
    console.error("PATCH /api/reservations/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update reservation" },
      { status: 500 }
    );
  }
}
