import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { type, description, roomNumber } = await req.json();

    if (!type || !roomNumber) {
      return NextResponse.json({ status: "error", message: "Données manquantes" }, { status: 400 });
    }

    // Le site est fixe pour ce prototype
    const request = await prisma.conciergeRequest.create({
      data: {
        type,
        description,
        roomNumber,
        site: "Astoria Palace",
        status: "PENDING"
      }
    });

    return NextResponse.json({ status: "success", data: request });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Erreur serveur" }, { status: 500 });
  }
}
