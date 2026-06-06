import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/halls - Retrieve all reception halls
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const halls = await prisma.receptionHall.findMany({
      include: {
        bookings: true,
      },
      orderBy: {
        capacity: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: halls });
  } catch (error: any) {
    console.error("GET /api/halls error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch reception halls" },
      { status: 500 }
    );
  }
}

// POST /api/halls - Create a new reception hall
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, capacity, pricePerHour, description, image } = body;

    if (!name || capacity === undefined || pricePerHour === undefined) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: name, capacity, pricePerHour" },
        { status: 400 }
      );
    }

    const hall = await prisma.receptionHall.create({
      data: {
        name,
        capacity: parseInt(capacity),
        pricePerHour: parseFloat(pricePerHour),
        description,
        image: image || "salle de reception.jpg",
      },
    });

    return NextResponse.json({ status: "success", data: hall }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/halls error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create reception hall" },
      { status: 500 }
    );
  }
}
