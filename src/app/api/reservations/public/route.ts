import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/public - Create a booking from the public website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkIn, checkOut, roomTypeId, clientName, clientEmail, clientPhone } = body;

    // Validate inputs
    if (!checkIn || !checkOut || !roomTypeId || !clientName || !clientEmail) {
      return NextResponse.json(
        { status: "error", message: "Informations de réservation incomplètes. Veuillez remplir tous les champs." },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Basic date validations
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { status: "error", message: "Les dates fournies sont invalides." },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        { status: "error", message: "La date d'arrivée ne peut pas être dans le passé." },
        { status: 400 }
      );
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { status: "error", message: "La date de départ doit être postérieure à la date d'arrivée." },
        { status: 400 }
      );
    }

    // 1. Double-booking algorithm: find all rooms of this type with overlapping reservations
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        NOT: {
          OR: [
            { checkOut: { lte: checkInDate } },
            { checkIn: { gte: checkOutDate } },
          ],
        },
      },
      select: {
        roomId: true,
      },
    });

    const bookedRoomIds = conflictingReservations.map((r) => r.roomId);

    // 2. Select a room of the requested type that is NOT in the booked room list
    const availableRoom = await prisma.room.findFirst({
      where: {
        roomTypeId,
        id: { notIn: bookedRoomIds },
      },
      include: {
        roomType: true,
      },
    });

    if (!availableRoom) {
      return NextResponse.json(
        {
          status: "error",
          message: "Désolé, aucune chambre de cette catégorie n'est disponible pour la période choisie.",
        },
        { status: 409 }
      );
    }

    // 3. Find or Create User (client)
    let user = await prisma.user.findUnique({
      where: { email: clientEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: clientEmail,
          name: clientName,
          password: clientPhone || "astoria123", // default password
          role: "CLIENT",
        },
      });

      // Initialize guest preferences
      await prisma.guestPreferences.create({
        data: {
          userId: user.id,
          beverages: "Eau minérale, Jus de fruits",
          pillowType: "Doux",
        },
      });
    }

    // 4. Calculate total price
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * availableRoom.roomType.price;

    // 5. Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomId: availableRoom.id,
        clientId: user.id,
        status: "PENDING",
        checkInStatus: "NOT_STARTED",
        totalPrice,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    // 6. Log transaction as a pending invoice
    await prisma.transaction.create({
      data: {
        amount: totalPrice,
        type: "INVOICE",
        status: "PENDING",
        description: `Facture Réservation Chambre ${availableRoom.number} (${availableRoom.roomType.name}) - Client: ${clientName}`,
        userId: user.id,
        category: "RESERVATION",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Votre réservation a été enregistrée avec succès !",
      data: {
        reservationId: reservation.id,
        roomNumber: availableRoom.number,
        roomTypeName: availableRoom.roomType.name,
        totalPrice,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        clientName,
      },
    });
  } catch (error: any) {
    console.error("POST /api/reservations/public error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Erreur interne lors de l'enregistrement de la réservation" },
      { status: 500 }
    );
  }
}
