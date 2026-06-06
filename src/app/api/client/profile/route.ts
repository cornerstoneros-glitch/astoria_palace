import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Dans un vrai système, on utiliserait le session_token/cookie
    // Pour ce prototype, on récupère le premier utilisateur avec le rôle CLIENT
    const clientUser = await prisma.user.findFirst({
      where: { role: "CLIENT" },
      include: {
        loyalty: true,
        preferences: true,
        reservations: {
          include: {
            room: {
              include: {
                roomType: true,
              }
            }
          },
          orderBy: { checkIn: 'desc' }
        }
      }
    });

    if (!clientUser) {
      return NextResponse.json({ status: "error", message: "Client non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: clientUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", message: "Erreur serveur" }, { status: 500 });
  }
}
