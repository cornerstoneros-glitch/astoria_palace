import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Update the Site name and location
    await prisma.site.updateMany({
      where: {}, // Update all sites since there should only be one
      data: {
        name: "Hôtel Astoria Palace",
        location: "Yopougon, Abidjan, Côte d'Ivoire"
      }
    });

    // 2. Update SystemSettings for hotel_name
    await prisma.systemSetting.updateMany({
      where: { key: "hotel_name" },
      data: { value: "Hôtel Astoria Palace" }
    });

    // 3. Find and delete the user "DIBONA" or "dibonandetraore"
    const usersToDelete = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: "dibona" } },
          { email: { contains: "roger.traore" } },
          { name: { contains: "DIBONA" } }
        ]
      }
    });

    for (const user of usersToDelete) {
      // Find their reservations
      const reservations = await prisma.reservation.findMany({ where: { clientId: user.id } });
      for (const res of reservations) {
        await prisma.kycData.deleteMany({ where: { reservationId: res.id } });
      }
      await prisma.reservation.deleteMany({ where: { clientId: user.id } });
      await prisma.guestPreferences.deleteMany({ where: { userId: user.id } });
      await prisma.loyaltyProgram.deleteMany({ where: { userId: user.id } });
      await prisma.transaction.deleteMany({ where: { userId: user.id } });
      await prisma.review.deleteMany({ where: { userId: user.id } });
      
      // Finally delete user
      await prisma.user.delete({ where: { id: user.id } });
    }

    return NextResponse.json({
      status: "success",
      message: "Base de données mise à jour avec succès !",
      updatedSites: await prisma.site.findMany(),
      deletedUsers: usersToDelete.map(u => u.email)
    });

  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message
    }, { status: 500 });
  }
}
