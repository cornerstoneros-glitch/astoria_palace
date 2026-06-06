import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/concierge - Retrieve client requests
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const roomNumber = searchParams.get("roomNumber");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (roomNumber) where.roomNumber = roomNumber;
    if (type) where.type = type;

    const requests = await prisma.conciergeRequest.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: requests });
  } catch (error: any) {
    console.error("GET /api/concierge error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST /api/concierge - Create a guest request (room service, housekeeping, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, roomNumber, site } = body;

    if (!type || !roomNumber || !site) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: type, roomNumber, site" },
        { status: 400 }
      );
    }

    const newRequest = await prisma.conciergeRequest.create({
      data: {
        type,
        description,
        roomNumber,
        site,
        status: "PENDING",
      },
    });

    return NextResponse.json({ status: "success", data: newRequest }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/concierge error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to submit request" },
      { status: 500 }
    );
  }
}
