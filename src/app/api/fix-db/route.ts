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
    // 4. Add Beverages to the Service table
    const site = await prisma.site.findFirst();
    if (site) {
      const services = [
        { name: "Eau Minérale Awa (1.5L)", description: "Bouteille d'eau plate locale", price: 1000, siteId: site.id },
        { name: "Sodas (Coca, Fanta, Sprite)", description: "Canette de soda 33cl bien fraîche", price: 1500, siteId: site.id },
        { name: "Jus de fruits naturels", description: "Ananas, Passion, Bissap ou Gingembre", price: 2500, siteId: site.id },
        { name: "Café Espresso / Thé", description: "Boisson chaude servie avec des petits fours", price: 2000, siteId: site.id },
        { name: "Bière locale (Bock 65cl)", description: "Bière blonde très glacée", price: 2000, siteId: site.id },
        { name: "Bouteille de Vin Rouge", description: "Bordeaux AOC, sélection de la cave", price: 15000, siteId: site.id },
        { name: "Bouteille de Champagne", description: "Moët & Chandon Brut Impérial", price: 80000, siteId: site.id },
        { name: "Cocktail de fruits frais", description: "Mix de fruits de saison sans alcool", price: 3500, siteId: site.id },
        { name: "Service en chambre (Room Service)", description: "Frais de livraison pour les repas et boissons en chambre", price: 3000, siteId: site.id },
      ];

      for (const svc of services) {
        // Only insert if it doesn't already exist
        const exists = await prisma.service.findFirst({ where: { name: svc.name, siteId: site.id } });
        if (!exists) {
          await prisma.service.create({ data: svc });
        }
      }
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
