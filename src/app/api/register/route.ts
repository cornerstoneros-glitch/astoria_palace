import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/register - Self-register to Club Astoria loyalty program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { status: "error", message: "Veuillez renseigner votre nom et votre adresse e-mail." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "Cette adresse e-mail est déjà inscrite au Club." },
        { status: 400 }
      );
    }

    // Create user and nested loyalty + preference profile with 100 welcome points
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: "club_member_default",
        role: "CLIENT",
        loyalty: {
          create: {
            points: 100, // 100 points welcome bonus!
            tier: "STANDARD",
          }
        },
        preferences: {
          create: {
            pillowType: "Doux",
            beverages: "Eau plate",
          }
        }
      }
    });

    return NextResponse.json({
      status: "success",
      message: "Bienvenue au Club Astoria ! Vous avez reçu 100 points bonus de bienvenue.",
      data: user,
    });
  } catch (error: any) {
    console.error("POST /api/register error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Erreur de création de compte." },
      { status: 500 }
    );
  }
}
