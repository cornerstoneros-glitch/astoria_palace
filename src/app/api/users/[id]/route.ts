import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// PATCH /api/users/[id] - Update user details (e.g. role, password, name)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, role, password, preferences, loyalty } = body;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { status: "error", message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Build update payload
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (password !== undefined) updateData.password = password;

    if (preferences !== undefined) {
      updateData.preferences = {
        upsert: {
          create: {
            pillowType: preferences.pillowType || null,
            beverages: preferences.beverages || null,
            cleaningTime: preferences.cleaningTime || null,
            dietaryNotes: preferences.dietaryNotes || null,
          },
          update: {
            pillowType: preferences.pillowType || null,
            beverages: preferences.beverages || null,
            cleaningTime: preferences.cleaningTime || null,
            dietaryNotes: preferences.dietaryNotes || null,
          },
        },
      };
    }

    if (loyalty !== undefined) {
      updateData.loyalty = {
        upsert: {
          create: {
            points: parseInt(loyalty.points) || 0,
            tier: loyalty.tier || "STANDARD",
          },
          update: {
            points: parseInt(loyalty.points) || 0,
            tier: loyalty.tier || "STANDARD",
          },
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
        loyalty: true,
        preferences: true,
      },
    });

    return NextResponse.json({ status: "success", data: updatedUser });
  } catch (error: any) {
    console.error(`PATCH /api/users/[id] error for ${JSON.stringify(params)}:`, error);
    return NextResponse.json(
      { status: "error", message: error.message || "Impossible de mettre à jour l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { status: "error", message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Delete related records to maintain database integrity (preferences, staff profiles, loyalty)
    // Prisma will error if relation is not clean.
    // Let's clean up related profiles if any.
    await prisma.$transaction([
      prisma.guestPreferences.deleteMany({ where: { userId: id } }),
      prisma.loyaltyProgram.deleteMany({ where: { userId: id } }),
      prisma.staff.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ status: "success", message: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    console.error(`DELETE /api/users/[id] error:`, error);
    return NextResponse.json(
      { status: "error", message: error.message || "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
