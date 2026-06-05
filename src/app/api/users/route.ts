import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/users - Retrieve all users (with optional role filter)
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: users });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Impossible de récupérer les utilisateurs" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user manually (admin/staff/client)
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Champs obligatoires manquants: email, mot de passe" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "Cet e-mail est déjà utilisé par un autre compte" },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password, // stored in clear text for this simple/mock control as user_rules specify simplicity unless active security is toggled
        role: role || "CLIENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ status: "success", data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
