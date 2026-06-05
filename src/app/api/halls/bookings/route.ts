import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/halls/bookings - Retrieve all event bookings
export async function GET(request: NextRequest) {
  try {
    const bookings = await prisma.hallBooking.findMany({
      include: {
        hall: true,
      },
      orderBy: {
        eventDate: "asc",
      },
    });

    return NextResponse.json({ status: "success", data: bookings });
  } catch (error: any) {
    console.error("GET /api/halls/bookings error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch event bookings" },
      { status: 500 }
    );
  }
}

// POST /api/halls/bookings - Create new event booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hallId, clientName, clientPhone, eventDate, durationHours } = body;

    if (!hallId || !clientName || !clientPhone || !eventDate || !durationHours) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: hallId, clientName, clientPhone, eventDate, durationHours" },
        { status: 400 }
      );
    }

    const hall = await prisma.receptionHall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      return NextResponse.json(
        { status: "error", message: "Reception hall not found" },
        { status: 450 }
      );
    }

    const totalPrice = hall.pricePerHour * parseInt(durationHours);

    const booking = await prisma.hallBooking.create({
      data: {
        hallId,
        clientName,
        clientPhone,
        eventDate: new Date(eventDate),
        durationHours: parseInt(durationHours),
        totalPrice,
        status: "PENDING",
      },
      include: {
        hall: true,
      },
    });

    return NextResponse.json({ status: "success", data: booking }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/halls/bookings error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to book reception hall" },
      { status: 500 }
    );
  }
}
