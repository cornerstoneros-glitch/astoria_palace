import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/[id]/kyc - Submit KYC data for a reservation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { idType, idNumber, idExpiry, idImage } = body;

    if (!idType || !idNumber) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: idType, idNumber" },
        { status: 400 }
      );
    }

    // Verify reservation existence
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { status: "error", message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Create or update KYC record (upsert)
    const kyc = await prisma.kycData.upsert({
      where: { reservationId: id },
      create: {
        idType,
        idNumber,
        idExpiry: idExpiry ? new Date(idExpiry) : null,
        idImage,
        reservationId: id,
      },
      update: {
        idType,
        idNumber,
        idExpiry: idExpiry ? new Date(idExpiry) : null,
        idImage,
      },
    });

    // Update reservation's checkInStatus to KYC_SUBMITTED
    await prisma.reservation.update({
      where: { id },
      data: {
        checkInStatus: "KYC_SUBMITTED",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "KYC data successfully submitted",
      data: kyc,
    });
  } catch (error: any) {
    console.error("POST /api/reservations/[id]/kyc error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to process KYC data" },
      { status: 500 }
    );
  }
}
