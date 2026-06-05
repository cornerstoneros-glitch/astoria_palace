import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// PATCH /api/promotions/[id] - Update a promotional offer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, discountPct, promoCode, image, startDate, endDate, isActive } = body;

    const promoExists = await prisma.promoOffer.findUnique({
      where: { id },
    });

    if (!promoExists) {
      return NextResponse.json(
        { status: "error", message: "Promotion introuvable" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discountPct !== undefined) updateData.discountPct = discountPct !== null ? parseFloat(discountPct) : null;
    if (promoCode !== undefined) updateData.promoCode = promoCode;
    if (image !== undefined) updateData.image = image;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = !!isActive;

    const updatedPromo = await prisma.promoOffer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ status: "success", data: updatedPromo });
  } catch (error: any) {
    console.error("PATCH /api/promotions/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update promotion" },
      { status: 500 }
    );
  }
}

// DELETE /api/promotions/[id] - Delete a promo offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const promoExists = await prisma.promoOffer.findUnique({
      where: { id },
    });

    if (!promoExists) {
      return NextResponse.json(
        { status: "error", message: "Promotion introuvable" },
        { status: 404 }
      );
    }

    await prisma.promoOffer.delete({
      where: { id },
    });

    return NextResponse.json({ status: "success", message: "Promotion supprimée avec succès" });
  } catch (error: any) {
    console.error("DELETE /api/promotions/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
