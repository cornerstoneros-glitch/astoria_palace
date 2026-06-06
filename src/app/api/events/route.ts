import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/events - Retrieve events
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.eventDate = { gte: new Date() }; // Show future events only
    }

    const events = await prisma.hotelEvent.findMany({
      where,
      orderBy: {
        eventDate: "asc", // Order chronologically by event date
      },
    });

    return NextResponse.json({ status: "success", data: events });
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, eventDate, price, image, isActive } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json(
        { status: "error", message: "Champs obligatoires manquants: titre, description, date de l'événement" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.hotelEvent.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        price: price !== undefined ? parseFloat(price) : 0,
        image: image || null,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return NextResponse.json({ status: "success", data: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
