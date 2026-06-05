import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/promotions - List all promotional offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};
    if (activeOnly) {
      const now = new Date();
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const promotions = await prisma.promoOffer.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: promotions });
  } catch (error: any) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Create a new promo offer
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, discountPct, promoCode, image, startDate, endDate, isActive } = body;

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { status: "error", message: "Champs obligatoires manquants: titre, description, date début, date fin" },
        { status: 400 }
      );
    }

    const newPromo = await prisma.promoOffer.create({
      data: {
        title,
        description,
        discountPct: discountPct ? parseFloat(discountPct) : null,
        promoCode: promoCode || null,
        image: image || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });

    return NextResponse.json({ status: "success", data: newPromo }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/promotions error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create promotion" },
      { status: 500 }
    );
  }
}
