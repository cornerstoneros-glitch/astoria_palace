import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations - List all reservations
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const roomId = searchParams.get("roomId");

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (roomId) where.roomId = roomId;

    const reservations = await prisma.reservation.findMany({
      where,
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
      orderBy: {
        checkIn: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: reservations });
  } catch (error: any) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkIn, checkOut, roomId, clientId, status, checkInStatus } = body;

    if (!checkIn || !checkOut || !roomId || !clientId) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: checkIn, checkOut, roomId, clientId" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { status: "error", message: "checkIn date must be before checkOut date" },
        { status: 400 }
      );
    }

    // 1. Fetch Room and RoomType details to verify existence and get rate
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    });

    if (!room) {
      return NextResponse.json(
        { status: "error", message: "Selected room does not exist" },
        { status: 404 }
      );
    }

    // 2. Fetch Client to verify existence
    const client = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { status: "error", message: "Selected client does not exist" },
        { status: 404 }
      );
    }

    // 3. Double-booking check: verify if the room is already reserved for overlapping dates
    const bookingConflict = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { in: ["PENDING", "CONFIRMED"] },
        NOT: {
          OR: [
            { checkOut: { lte: checkInDate } },
            { checkIn: { gte: checkOutDate } },
          ],
        },
      },
    });

    if (bookingConflict) {
      return NextResponse.json(
        {
          status: "error",
          message: "Room is already booked for the selected dates",
        },
        { status: 409 }
      );
    }

    // 4. Calculate total price automatically if not provided
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * room.roomType.price;

    // 5. Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomId,
        clientId,
        status: status || "PENDING",
        checkInStatus: checkInStatus || "NOT_STARTED",
        totalPrice,
      },
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

    // 6. Log transaction in ledger
    const isPaid = reservation.status === "CONFIRMED" || reservation.status === "COMPLETED";
    await prisma.transaction.create({
      data: {
        amount: totalPrice,
        type: isPaid ? "PAYMENT" : "INVOICE",
        status: isPaid ? "PAID" : "PENDING",
        description: `${isPaid ? 'Paiement' : 'Facture'} Réservation Chambre ${reservation.room.number} (${reservation.room.roomType.name}) - Client: ${reservation.client.name || reservation.client.email} [ID: ${reservation.id}]`,
        userId: clientId,
        category: "RESERVATION",
      },
    });

    return NextResponse.json({ status: "success", data: reservation }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create reservation" },
      { status: 500 }
    );
  }
}
