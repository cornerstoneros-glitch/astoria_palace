import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // 1. Clean existing database records
  await prisma.systemSetting.deleteMany({});
  await prisma.dishComponent.deleteMany({});
  await prisma.dish.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.conciergeRequest.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.loyaltyProgram.deleteMany({});
  await prisma.guestPreferences.deleteMany({});
  await prisma.kycData.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.site.deleteMany({});

  console.log("Database cleared.");

  // 2. Create Site
  const site = await prisma.site.create({
    data: {
      name: "Hôtel Astoria Palace",
      location: "Yopougon, Abidjan, Côte d'Ivoire",
      description: "Complexe hôtelier haut de gamme à Yopougon, Abidjan - Hébergement, Restauration, Salles de Spectacle, Piscine et Loisirs.",
    },
  });
  console.log(`Site created: ${site.name}`);

  // 3. Create System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "hotel_name", value: "Hôtel Astoria Palace" },
      { key: "currency", value: "FCFA" },
      { key: "address", value: "Yopougon, Abidjan, Côte d'Ivoire" },
      { key: "contact_email", value: "contact@astoriapalace.ci" },
      { key: "contact_phone", value: "+225 07 00 00 00 00" },
    ],
  });
  console.log("System settings configured.");

  // 4. Create Room Types
  const standard = await prisma.roomType.create({
    data: {
      name: "Chambre Standard",
      description: "Lit double, climatisation, TV, Wi-Fi, salle de bain privée.",
      price: 35000,
      capacity: 2,
    },
  });

  const superior = await prisma.roomType.create({
    data: {
      name: "Chambre Supérieure",
      description: "Lit double, climatisation, TV, Wi-Fi, mini-bar, vue jardin ou piscine.",
      price: 50000,
      capacity: 2,
    },
  });

  const juniorSuite = await prisma.roomType.create({
    data: {
      name: "Junior Suite",
      description: "Salon séparé, bureau, baignoire, coffre-fort, vue panoramique.",
      price: 75000,
      capacity: 2,
    },
  });

  const executiveSuite = await prisma.roomType.create({
    data: {
      name: "Suite Exécutive",
      description: "Grand living room, kitchenette, terrasse privée, finitions luxe.",
      price: 120000,
      capacity: 4,
    },
  });

  const presidentialSuite = await prisma.roomType.create({
    data: {
      name: "Suite Présidentielle",
      description: "2 chambres, grand salon de réception, jacuzzi, service de majordome privé.",
      price: 250000,
      capacity: 4,
    },
  });

  console.log("Room types created.");

  // 5. Create Rooms
  const roomsData = [
    // Standard rooms
    { number: "101", roomTypeId: standard.id, siteId: site.id, status: "AVAILABLE" },
    { number: "102", roomTypeId: standard.id, siteId: site.id, status: "AVAILABLE" },
    { number: "103", roomTypeId: standard.id, siteId: site.id, status: "AVAILABLE" },
    { number: "104", roomTypeId: standard.id, siteId: site.id, status: "AVAILABLE" },
    { number: "105", roomTypeId: standard.id, siteId: site.id, status: "CLEANING" },
    // Superior rooms
    { number: "201", roomTypeId: superior.id, siteId: site.id, status: "AVAILABLE" },
    { number: "202", roomTypeId: superior.id, siteId: site.id, status: "AVAILABLE" },
    { number: "203", roomTypeId: superior.id, siteId: site.id, status: "OCCUPIED" },
    { number: "204", roomTypeId: superior.id, siteId: site.id, status: "MAINTENANCE" },
    // Junior Suites
    { number: "301", roomTypeId: juniorSuite.id, siteId: site.id, status: "AVAILABLE" },
    { number: "302", roomTypeId: juniorSuite.id, siteId: site.id, status: "OCCUPIED" },
    // Executive Suites
    { number: "401", roomTypeId: executiveSuite.id, siteId: site.id, status: "AVAILABLE" },
    // Presidential Suite
    { number: "501", roomTypeId: presidentialSuite.id, siteId: site.id, status: "AVAILABLE" },
  ];

  for (const r of roomsData) {
    await prisma.room.create({ data: r });
  }
  console.log("Rooms seeded.");

  // 6. Create Users & Staff
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@astoriapalace.ci",
      name: "Directeur Général",
      password: "password123", // In a real app, hash this password
      role: "ADMIN",
    },
  });

  const recepUser = await prisma.user.create({
    data: {
      email: "reception@astoriapalace.ci",
      name: "Réceptionniste Astoria",
      password: "password123",
      role: "STAFF",
    },
  });

  const chefUser = await prisma.user.create({
    data: {
      email: "chef@astoriapalace.ci",
      name: "Chef Cuisine",
      password: "password123",
      role: "STAFF",
    },
  });

  // Create Staff profiles
  await prisma.staff.create({
    data: {
      userId: recepUser.id,
      siteId: site.id,
      position: "Receptionist",
    },
  });

  await prisma.staff.create({
    data: {
      userId: chefUser.id,
      siteId: site.id,
      position: "Chef",
    },
  });

  console.log("Users and staff accounts seeded.");

  // 7. Create Services
  await prisma.service.createMany({
    data: [
      { name: "Accès Piscine (Visiteur)", description: "Entrée journée piscine pour clients externes", price: 5000, siteId: site.id },
      { name: "Cours de Natation", description: "Session de 1 heure avec maître-nageur", price: 15000, siteId: site.id },
      { name: "Accès Salle de Prestige", description: "Location de la grande salle (300 personnes) à la journée", price: 500000, siteId: site.id },
      { name: "Accès Salle de Conférence A", description: "Location journée de la salle (80 personnes)", price: 150000, siteId: site.id },
      { name: "Massage Bien-être 60min", description: "Massage relaxant aux huiles essentielles", price: 25000, siteId: site.id },
    ],
  });
  console.log("Hotel services seeded.");

  // 8. Create Inventory Items (Food & Beverage / Housekeeping stocks)
  await prisma.inventoryItem.createMany({
    data: [
      { name: "Draps de lit Double", category: "Linen", quantity: 150, unit: "unit", minThreshold: 30, siteId: site.id },
      { name: "Serviettes de bain", category: "Linen", quantity: 300, unit: "unit", minThreshold: 50, siteId: site.id },
      { name: "Riz local de Côte d'Ivoire", category: "Food", quantity: 250, unit: "kg", minThreshold: 50, siteId: site.id },
      { name: "Poulet congelé", category: "Food", quantity: 80, unit: "unit", minThreshold: 20, siteId: site.id },
      { name: "Bouteilles d'eau 1.5L", category: "Beverage", quantity: 500, unit: "bottle", minThreshold: 100, siteId: site.id },
      { name: "Savons d'accueil", category: "Housekeeping", quantity: 1000, unit: "unit", minThreshold: 100, siteId: site.id },
    ],
  });
  console.log("Inventory seeded.");

  // 9. Create Restaurant Menu (Dishes)
  const dish1 = await prisma.dish.create({
    data: {
      name: "Kédjénou de Poulet de l'Astoria",
      category: "Signature",
      description: "Recette traditionnelle ivoirienne, poulet mijoté à l'étouffée avec légumes, piments et aromates.",
      price: 8500,
      siteId: site.id,
      isActive: true,
    },
  });

  const dish2 = await prisma.dish.create({
    data: {
      name: "Plat d'Attiéké Poisson Braisé",
      category: "Tradition",
      description: "Poisson carpe ou thon braisé au feu de bois, accompagné d'attiéké frais, oignons, tomates et piment.",
      price: 7000,
      siteId: site.id,
      isActive: true,
    },
  });

  const dish3 = await prisma.dish.create({
    data: {
      name: "Sauce Graine au Foutou Banane",
      category: "Terroir",
      description: "Sauce de noix de palme mijotée avec viande de brousse ou poisson fumé, servie avec son foutou banane.",
      price: 6500,
      siteId: site.id,
      isActive: true,
    },
  });

  // Create components for Dishes (Garnishes, Options)
  await prisma.dishComponent.createMany({
    data: [
      { name: "Attiéké", type: "GARNISH", optional: false, dishId: dish1.id },
      { name: "Riz blanc", type: "GARNISH", optional: true, dishId: dish1.id },
      { name: "Alloco", type: "GARNISH", optional: true, dishId: dish2.id },
      { name: "Piment rouge doux", type: "SAUCE", optional: true, dishId: dish2.id },
      { name: "Viande de bœuf supplémentaire", type: "PROTEIN", optional: true, dishId: dish3.id },
    ],
  });

  console.log("Restaurant menu and dishes seeded.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
