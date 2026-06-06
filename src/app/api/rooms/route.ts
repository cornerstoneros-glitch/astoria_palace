import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms - List all rooms
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const roomTypeId = searchParams.get("roomTypeId");
    const siteId = searchParams.get("siteId");

    const where: any = {};
    if (status) where.status = status;
    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (siteId) where.siteId = siteId;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        roomType: true,
        site: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({ status: "success", data: rooms });
  } catch (error: any) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, roomTypeId, siteId, status } = body;

    if (!number || !roomTypeId || !siteId) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: number, roomTypeId, siteId" },
        { status: 400 }
      );
    }

    // Check if room number already exists at this site
    const existingRoom = await prisma.room.findFirst({
      where: {
        number,
        siteId,
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { status: "error", message: `Room ${number} already exists at this site` },
        { status: 409 }
      );
    }

    const room = await prisma.room.create({
      data: {
        number,
        roomTypeId,
        siteId,
        status: status || "AVAILABLE",
      },
      include: {
        roomType: true,
        site: true,
      },
    });

    return NextResponse.json({ status: "success", data: room }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
