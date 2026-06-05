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
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
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
  await prisma.hallBooking.deleteMany({});
  await prisma.receptionHall.deleteMany({});

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

  // 4. Create Room Types with custom image references
  const standard = await prisma.roomType.create({
    data: {
      name: "Chambre Standard",
      description: "Lit double, climatisation, TV, Wi-Fi, salle de bain privée.",
      price: 35000,
      capacity: 2,
      image: "chambre.jpg"
    },
  });

  const superior = await prisma.roomType.create({
    data: {
      name: "Chambre Supérieure",
      description: "Lit double, climatisation, TV, Wi-Fi, mini-bar, vue jardin ou piscine.",
      price: 50000,
      capacity: 2,
      image: "chambre2.jpg"
    },
  });

  const juniorSuite = await prisma.roomType.create({
    data: {
      name: "Junior Suite",
      description: "Salon séparé, bureau, baignoire, coffre-fort, vue panoramique.",
      price: 75000,
      capacity: 2,
      image: "suite.jpg"
    },
  });

  const executiveSuite = await prisma.roomType.create({
    data: {
      name: "Suite Exécutive",
      description: "Grand living room, kitchenette, terrasse privée, finitions luxe.",
      price: 120000,
      capacity: 4,
      image: "suite2.jpg"
    },
  });

  const presidentialSuite = await prisma.roomType.create({
    data: {
      name: "Suite Présidentielle",
      description: "2 chambres, grand salon de réception, jacuzzi, service de majordome privé.",
      price: 250000,
      capacity: 4,
      image: "suite presidentielle.jpg"
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

  // 6. Create Users & Staff (HR records)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@astoriapalace.ci",
      name: "Directeur Général",
      password: "password123",
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

  const govUser = await prisma.user.create({
    data: {
      email: "gouvernante@astoriapalace.ci",
      name: "Marie-Claire Yao",
      password: "password123",
      role: "STAFF"
    }
  });

  const barmanUser = await prisma.user.create({
    data: {
      email: "barman@astoriapalace.ci",
      name: "Jean-Pierre Kouamé",
      password: "password123",
      role: "STAFF"
    }
  });

  // Create Staff profiles (RH tracking)
  await prisma.staff.create({
    data: {
      userId: recepUser.id,
      siteId: site.id,
      position: "Receptionist",
      salary: 220000,
      contractType: "CDI",
      shift: "Matin (06h - 14h)",
      status: "ACTIVE",
    },
  });

  await prisma.staff.create({
    data: {
      userId: chefUser.id,
      siteId: site.id,
      position: "Chef",
      salary: 450000,
      contractType: "CDI",
      shift: "Administratif (08h - 17h)",
      status: "ACTIVE",
    },
  });

  await prisma.staff.create({
    data: {
      userId: govUser.id,
      siteId: site.id,
      position: "Housekeeping",
      salary: 180000,
      contractType: "CDD",
      shift: "Après-midi (14h - 22h)",
      status: "ACTIVE"
    }
  });

  await prisma.staff.create({
    data: {
      userId: barmanUser.id,
      siteId: site.id,
      position: "Bartender",
      salary: 210000,
      contractType: "CDI",
      shift: "Nuit (22h - 06h)",
      status: "ACTIVE"
    }
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

  // 10. Create Reception Halls
  const hall1 = await prisma.receptionHall.create({
    data: {
      name: "Grand Salon Djiboua",
      capacity: 300,
      pricePerHour: 50000,
      description: "Grande salle des fêtes modulable, parfaite pour mariages, congrès et banquets d'entreprise.",
      image: "salle de reception.jpg"
    }
  });

  const hall2 = await prisma.receptionHall.create({
    data: {
      name: "Salon VIP Lagune",
      capacity: 80,
      pricePerHour: 25000,
      description: "Salle de conférence de prestige avec vue panoramique et équipements de visio-conférence.",
      image: "salle de reception2.jpg"
    }
  });
  console.log("Reception halls seeded.");

  // 11. Create Hall Bookings
  await prisma.hallBooking.create({
    data: {
      hallId: hall1.id,
      clientName: "Groupement Inter-Écoles CI",
      clientPhone: "+225 05 55 44 33 22",
      eventDate: new Date("2026-06-12T09:00:00Z"),
      durationHours: 8,
      totalPrice: 400000,
      status: "CONFIRMED"
    }
  });

  await prisma.hallBooking.create({
    data: {
      hallId: hall2.id,
      clientName: "Ministère de la Transition Digitale",
      clientPhone: "+225 07 77 88 99 00",
      eventDate: new Date("2026-06-20T14:00:00Z"),
      durationHours: 4,
      totalPrice: 100000,
      status: "PENDING"
    }
  });

  // 12. Create Bar Items as Dishes with Category "Bar"
  const beerItem = await prisma.dish.create({
    data: {
      name: "Bière Ivoirienne Bock Solibra",
      category: "Bar",
      description: "Bière blonde nationale servie très glacée.",
      price: 2000,
      siteId: site.id,
      isActive: true
    }
  });

  const cocktailItem = await prisma.dish.create({
    data: {
      name: "Astoria Lagoon Cocktail",
      category: "Bar",
      description: "Cocktail signature de la maison : rhum, jus d'ananas local, coco et sirop de gingembre.",
      price: 5000,
      siteId: site.id,
      isActive: true
    }
  });

  // 13. Create Food & Beverage Orders
  const order1 = await prisma.order.create({
    data: {
      type: "RESTAURANT",
      tableNumber: "Table N° 5",
      status: "SERVED",
      totalPrice: 15500,
    }
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, dishId: dish1.id, dishName: dish1.name, quantity: 1, price: 8500 },
      { orderId: order1.id, dishId: dish2.id, dishName: dish2.name, quantity: 1, price: 7000 }
    ]
  });

  const order2 = await prisma.order.create({
    data: {
      type: "BAR",
      tableNumber: "Pool Bar Lounge",
      status: "PAID",
      totalPrice: 12000,
    }
  });
  await prisma.orderItem.createMany({
    data: [
      { orderId: order2.id, dishId: cocktailItem.id, dishName: cocktailItem.name, quantity: 2, price: 5000 },
      { orderId: order2.id, dishId: beerItem.id, dishName: beerItem.name, quantity: 1, price: 2000 }
    ]
  });

  // 14. Create Bookkeeping Accounting Transactions (Corporate Incomes and Expenses)
  await prisma.transaction.createMany({
    data: [
      // Incomes
      { amount: 350000, type: "PAYMENT", status: "PAID", description: "Recette Hébergement Séjour Roger Traore", category: "RESERVATION" },
      { amount: 15500, type: "PAYMENT", status: "PAID", description: "Recette F&B Restaurant Table 5", category: "FNB" },
      { amount: 12000, type: "PAYMENT", status: "PAID", description: "Recette F&B Bar Salon Pool", category: "FNB" },
      { amount: 400000, type: "PAYMENT", status: "PAID", description: "Location Salle de Réception Djiboua", category: "EVENTS" },
      // Expenses
      { amount: -450000, type: "EXPENSE", status: "PAID", description: "Salaires RH - Chef Cuisine", category: "SALARY" },
      { amount: -220000, type: "EXPENSE", status: "PAID", description: "Salaires RH - Réceptionniste", category: "SALARY" },
      { amount: -150000, type: "EXPENSE", status: "PAID", description: "Abonnement Électricité CIE Yopougon", category: "UTILITIES" },
      { amount: -85000, type: "EXPENSE", status: "PAID", description: "Achats Approvisionnement Stocks Draps", category: "RESTOCK" },
      { amount: -120000, type: "EXPENSE", status: "PAID", description: "Achats Ingrédients F&B Marché de Yopougon", category: "RESTOCK" }
    ]
  });
  console.log("Accounting records and orders seeded.");

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
