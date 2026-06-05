import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Hôtel Astoria Palace...");

  // ── 1. Nettoyage ──────────────────────────────────────────────────────────
  await prisma.promoOffer.deleteMany({});
  await prisma.hotelEvent.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.dishComponent.deleteMany({});
  await prisma.dish.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.conciergeRequest.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.loyaltyProgram.deleteMany({});
  await prisma.guestPreferences.deleteMany({});
  await prisma.kycData.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.hallBooking.deleteMany({});
  await prisma.receptionHall.deleteMany({});
  console.log("✓ Base nettoyée");

  // ── 2. Site ───────────────────────────────────────────────────────────────
  const site = await prisma.site.create({
    data: {
      name: "Hôtel Astoria Palace",
      location: "Yopougon, Abidjan, Côte d'Ivoire",
      description: "Complexe hôtelier haut de gamme à Yopougon, Abidjan — Hébergement, Restauration, Salles de Spectacle, Piscine et Loisirs.",
    },
  });

  // ── 3. Paramètres système ─────────────────────────────────────────────────
  await prisma.systemSetting.createMany({
    data: [
      { key: "hotel_name", value: "Hôtel Astoria Palace" },
      { key: "currency", value: "FCFA" },
      { key: "address", value: "Quartier Commerce, Yopougon, Abidjan, Côte d'Ivoire" },
      { key: "contact_email", value: "contact@astoriapalace.ci" },
      { key: "contact_phone", value: "+225 07 00 00 00 00" },
      { key: "rooms_total", value: "77" },
      { key: "check_in_time", value: "14:00" },
      { key: "check_out_time", value: "11:00" },
    ],
  });
  console.log("✓ Paramètres système");

  // ── 4. Types de chambres ─────────────────────────────────────────────────
  const standard = await prisma.roomType.create({
    data: { name: "Chambre Standard", description: "Lit double, climatisation, TV, Wi-Fi, salle de bain privée.", price: 35000, capacity: 2, image: "chambre.jpg" },
  });
  const superior = await prisma.roomType.create({
    data: { name: "Chambre Supérieure", description: "Lit double, climatisation, TV, Wi-Fi, mini-bar, vue jardin ou piscine.", price: 50000, capacity: 2, image: "chambre2.jpg" },
  });
  const juniorSuite = await prisma.roomType.create({
    data: { name: "Junior Suite", description: "Salon séparé, bureau, baignoire, coffre-fort, vue panoramique.", price: 75000, capacity: 2, image: "suite.jpg" },
  });
  const executiveSuite = await prisma.roomType.create({
    data: { name: "Suite Exécutive", description: "Grand living room, kitchenette, terrasse privée, finitions luxe.", price: 120000, capacity: 4, image: "suite2.jpg" },
  });
  const presidentialSuite = await prisma.roomType.create({
    data: { name: "Suite Présidentielle", description: "2 chambres, grand salon de réception, jacuzzi, service de majordome privé.", price: 250000, capacity: 4, image: "suite presidentielle.jpg" },
  });
  console.log("✓ Types de chambres");

  // ── 5. Chambres ───────────────────────────────────────────────────────────
  // 40 Standard (101-140)
  const standardStatuses = ["OCCUPIED","AVAILABLE","AVAILABLE","OCCUPIED","CLEANING","AVAILABLE","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","CLEANING","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","MAINTENANCE","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","OCCUPIED","AVAILABLE","CLEANING","AVAILABLE","AVAILABLE","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","CLEANING","OCCUPIED","AVAILABLE","AVAILABLE"];
  for (let i = 0; i < 40; i++) {
    await prisma.room.create({ data: { number: (101 + i).toString(), roomTypeId: standard.id, siteId: site.id, status: standardStatuses[i] } });
  }
  // 30 Supérieure (201-230)
  const superiorStatuses = ["OCCUPIED","AVAILABLE","AVAILABLE","MAINTENANCE","AVAILABLE","OCCUPIED","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","CLEANING","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","CLEANING","AVAILABLE","AVAILABLE","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","CLEANING","OCCUPIED","AVAILABLE","AVAILABLE","AVAILABLE","MAINTENANCE","OCCUPIED"];
  for (let i = 0; i < 30; i++) {
    await prisma.room.create({ data: { number: (201 + i).toString(), roomTypeId: superior.id, siteId: site.id, status: superiorStatuses[i] } });
  }
  // 3 Junior Suites (301-303)
  await prisma.room.create({ data: { number: "301", roomTypeId: juniorSuite.id, siteId: site.id, status: "OCCUPIED" } });
  await prisma.room.create({ data: { number: "302", roomTypeId: juniorSuite.id, siteId: site.id, status: "AVAILABLE" } });
  await prisma.room.create({ data: { number: "303", roomTypeId: juniorSuite.id, siteId: site.id, status: "OCCUPIED" } });
  // 2 Executive Suites (401-402)
  await prisma.room.create({ data: { number: "401", roomTypeId: executiveSuite.id, siteId: site.id, status: "OCCUPIED" } });
  await prisma.room.create({ data: { number: "402", roomTypeId: executiveSuite.id, siteId: site.id, status: "AVAILABLE" } });
  // 2 Presidential Suites (501-502)
  await prisma.room.create({ data: { number: "501", roomTypeId: presidentialSuite.id, siteId: site.id, status: "OCCUPIED" } });
  await prisma.room.create({ data: { number: "502", roomTypeId: presidentialSuite.id, siteId: site.id, status: "AVAILABLE" } });
  console.log("✓ 77 chambres créées");

  // ── 6. Utilisateurs (staff + clients) ─────────────────────────────────────
  const adminUser = await prisma.user.create({ data: { email: "admin@astoriapalace.ci", name: "Directeur Général", password: "astoria2026", role: "ADMIN" } });
  const recepUser = await prisma.user.create({ data: { email: "reception@astoriapalace.ci", name: "Aïssatou Diallo", password: "astoria2026", role: "STAFF" } });
  const chefUser  = await prisma.user.create({ data: { email: "chef@astoriapalace.ci", name: "Jean-Baptiste Kouamé", password: "astoria2026", role: "STAFF" } });
  const govUser   = await prisma.user.create({ data: { email: "gouvernante@astoriapalace.ci", name: "Marie-Claire Yao", password: "astoria2026", role: "STAFF" } });
  const barmanUser = await prisma.user.create({ data: { email: "barman@astoriapalace.ci", name: "Koné Adama", password: "astoria2026", role: "STAFF" } });
  const secuUser   = await prisma.user.create({ data: { email: "securite@astoriapalace.ci", name: "Ouattara Mamadou", password: "astoria2026", role: "STAFF" } });
  const maintenUser = await prisma.user.create({ data: { email: "maintenance@astoriapalace.ci", name: "Bogui Franck", password: "astoria2026", role: "STAFF" } });
  const recep2User  = await prisma.user.create({ data: { email: "reception2@astoriapalace.ci", name: "Traore Awa", password: "astoria2026", role: "STAFF" } });

  // Clients
  const client1 = await prisma.user.create({ data: { email: "roger.traore@gmail.com", name: "DIBONA ROGER TRAORE", password: "client123", role: "CLIENT" } });
  const client2 = await prisma.user.create({ data: { email: "patrice.yao@yahoo.fr", name: "KOUAME PATRICE YAO", password: "client123", role: "CLIENT" } });
  const client3 = await prisma.user.create({ data: { email: "marie.bamba@ci-news.com", name: "MARIE-JOSEPHE BAMBA", password: "client123", role: "CLIENT" } });
  const client4 = await prisma.user.create({ data: { email: "serge.amani@outlook.com", name: "AMANI KOFFI SERGE", password: "client123", role: "CLIENT" } });
  const client5 = await prisma.user.create({ data: { email: "fatou.diomande@gmail.com", name: "FATOU DIOMANDÉ", password: "client123", role: "CLIENT" } });
  const client6 = await prisma.user.create({ data: { email: "ibrahima.cisse@sgbci.ci", name: "IBRAHIMA CISSÉ", password: "client123", role: "CLIENT" } });
  const client7 = await prisma.user.create({ data: { email: "valerie.assi@un.org", name: "VALÉRIE ASSI", password: "client123", role: "CLIENT" } });
  const client8 = await prisma.user.create({ data: { email: "christophe.gnagne@gmail.com", name: "CHRISTOPHE GNAGNÉ", password: "client123", role: "CLIENT" } });
  console.log("✓ Utilisateurs créés");

  // ── 7. Staff RH ───────────────────────────────────────────────────────────
  await prisma.staff.create({ data: { userId: recepUser.id, siteId: site.id, position: "Receptionist", salary: 220000, contractType: "CDI", shift: "Matin (06h - 14h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: chefUser.id, siteId: site.id, position: "Chef", salary: 480000, contractType: "CDI", shift: "Administratif (08h - 17h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: govUser.id, siteId: site.id, position: "Housekeeping", salary: 180000, contractType: "CDD", shift: "Après-midi (14h - 22h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: barmanUser.id, siteId: site.id, position: "Bartender", salary: 210000, contractType: "CDI", shift: "Nuit (22h - 06h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: secuUser.id, siteId: site.id, position: "Security", salary: 160000, contractType: "CDI", shift: "Nuit (22h - 06h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: maintenUser.id, siteId: site.id, position: "Maintenance", salary: 195000, contractType: "CDI", shift: "Matin (06h - 14h)", status: "ACTIVE" } });
  await prisma.staff.create({ data: { userId: recep2User.id, siteId: site.id, position: "Receptionist", salary: 215000, contractType: "CDI", shift: "Après-midi (14h - 22h)", status: "ACTIVE" } });
  console.log("✓ Staff RH");

  // ── 8. Préférences clients & Fidélité ─────────────────────────────────────
  const clientsWithPrefs = [
    { user: client1, bevs: "Eau minérale Évian, Jus de bissap", pillow: "Ferme", tier: "GOLD" },
    { user: client2, bevs: "Bière Solibra, Eau plate", pillow: "Doux", tier: "SILVER" },
    { user: client3, bevs: "Thé vert, Eau pétillante", pillow: "Doux", tier: "PLATINUM" },
    { user: client4, bevs: "Café, Jus d'orange", pillow: "Ferme", tier: "STANDARD" },
    { user: client5, bevs: "Jus de fruits tropicaux", pillow: "Moyen", tier: "SILVER" },
    { user: client6, bevs: "Whisky, Eau minérale", pillow: "Ferme", tier: "GOLD" },
    { user: client7, bevs: "Champagne, Eau plate", pillow: "Doux", tier: "PLATINUM" },
    { user: client8, bevs: "Bière, Sodas", pillow: "Moyen", tier: "STANDARD" },
  ];
  for (const c of clientsWithPrefs) {
    await prisma.guestPreferences.create({ data: { userId: c.user.id, beverages: c.bevs, pillowType: c.pillow } });
    await prisma.loyaltyProgram.create({ data: { userId: c.user.id, points: c.tier === "PLATINUM" ? 8500 : c.tier === "GOLD" ? 4200 : c.tier === "SILVER" ? 1800 : 350, tier: c.tier } });
  }
  console.log("✓ Préférences & fidélité clients");

  // ── 9. Services ───────────────────────────────────────────────────────────
  await prisma.service.createMany({
    data: [
      { name: "Accès Piscine (Visiteur)", description: "Entrée journée piscine pour clients externes", price: 5000, siteId: site.id },
      { name: "Cours de Natation", description: "Session 1h avec maître-nageur diplômé", price: 15000, siteId: site.id },
      { name: "Location Grande Salle Djiboua", description: "Grande salle des fêtes (300 personnes) à la journée", price: 500000, siteId: site.id },
      { name: "Location Salon VIP Lagune", description: "Salle de conférence de prestige (80 personnes)", price: 150000, siteId: site.id },
      { name: "Massage Bien-être 60min", description: "Massage relaxant aux huiles essentielles", price: 25000, siteId: site.id },
      { name: "Transfert Aéroport", description: "Navette privée Aéroport FHB ↔ Hôtel", price: 35000, siteId: site.id },
      { name: "Pressing Express", description: "Blanchisserie et repassage sous 4h", price: 8000, siteId: site.id },
    ],
  });

  // ── 10. Inventaire ────────────────────────────────────────────────────────
  await prisma.inventoryItem.createMany({
    data: [
      { name: "Draps de lit Double (200x220)", category: "Linen", quantity: 150, unit: "pièce", minThreshold: 30, siteId: site.id },
      { name: "Serviettes de bain (60x120)", category: "Linen", quantity: 320, unit: "pièce", minThreshold: 60, siteId: site.id },
      { name: "Serviettes de piscine", category: "Linen", quantity: 80, unit: "pièce", minThreshold: 20, siteId: site.id },
      { name: "Riz local (Sac 25kg)", category: "Food", quantity: 12, unit: "sac", minThreshold: 4, siteId: site.id },
      { name: "Poulet entier congelé", category: "Food", quantity: 45, unit: "pièce", minThreshold: 15, siteId: site.id },
      { name: "Poisson Carpe (kg)", category: "Food", quantity: 30, unit: "kg", minThreshold: 10, siteId: site.id },
      { name: "Légumes frais (assortiment)", category: "Food", quantity: 18, unit: "kg", minThreshold: 5, siteId: site.id },
      { name: "Bouteilles d'eau 1.5L (Caisse)", category: "Beverage", quantity: 48, unit: "caisse", minThreshold: 12, siteId: site.id },
      { name: "Bière Solibra 65cl", category: "Beverage", quantity: 240, unit: "bouteille", minThreshold: 50, siteId: site.id },
      { name: "Vins rouges (carton 6btl)", category: "Beverage", quantity: 8, unit: "carton", minThreshold: 3, siteId: site.id },
      { name: "Jus de fruits tropicaux 1L", category: "Beverage", quantity: 72, unit: "bouteille", minThreshold: 20, siteId: site.id },
      { name: "Savons d'accueil (boîte 100)", category: "Housekeeping", quantity: 12, unit: "boîte", minThreshold: 3, siteId: site.id },
      { name: "Gel douche 250ml", category: "Housekeeping", quantity: 9, unit: "carton", minThreshold: 2, siteId: site.id },
      { name: "Papier toilette (rouleau)", category: "Housekeeping", quantity: 400, unit: "rouleau", minThreshold: 80, siteId: site.id },
      { name: "Produits ménagers (bidon 5L)", category: "Housekeeping", quantity: 18, unit: "bidon", minThreshold: 5, siteId: site.id },
      { name: "Ampoules LED E27", category: "Maintenance", quantity: 6, unit: "boîte", minThreshold: 2, siteId: site.id },
    ],
  });
  console.log("✓ Inventaire");

  // ── 11. Menu Restaurant ───────────────────────────────────────────────────
  const dish1 = await prisma.dish.create({ data: { name: "Kédjénou de Poulet de l'Astoria", category: "Signature", description: "Recette traditionnelle ivoirienne, poulet mijoté à l'étouffée avec légumes, piments et aromates du terroir.", price: 8500, siteId: site.id, isActive: true } });
  const dish2 = await prisma.dish.create({ data: { name: "Attiéké Poisson Braisé", category: "Tradition", description: "Poisson carpe braisé au feu de bois, accompagné d'attiéké frais, oignons, tomates et piment vert.", price: 7000, siteId: site.id, isActive: true } });
  const dish3 = await prisma.dish.create({ data: { name: "Sauce Graine au Foutou Banane", category: "Terroir", description: "Sauce de noix de palme mijotée avec viande de brousse fumée, servie avec son foutou banane traditionnel.", price: 6500, siteId: site.id, isActive: true } });
  const dish4 = await prisma.dish.create({ data: { name: "Thieboudienne Royal", category: "Prestige", description: "Riz au poisson d'inspiration sénégalaise, garni de légumes variés et de poisson frais du jour, sauce rouge parfumée.", price: 9500, siteId: site.id, isActive: true } });
  const dish5 = await prisma.dish.create({ data: { name: "Brochettes de Bœuf Grillé", category: "Grillade", description: "Brochettes de bœuf marinées aux épices africaines, grillées au charbon de bois, accompagnées de frites dorées.", price: 7500, siteId: site.id, isActive: true } });
  const dish6 = await prisma.dish.create({ data: { name: "Soupe Légère Yassa Poulet", category: "Tradition", description: "Recette sénégalo-ivoirienne, poulet mariné à l'oignon caramélisé et citron, servi avec riz blanc parfumé.", price: 8000, siteId: site.id, isActive: true } });

  // Bar
  const beerItem = await prisma.dish.create({ data: { name: "Bière Solibra Bock 65cl", category: "Bar", description: "Bière blonde nationale servie très glacée.", price: 2000, siteId: site.id, isActive: true } });
  const cocktail1 = await prisma.dish.create({ data: { name: "Astoria Lagoon Cocktail", category: "Bar", description: "Cocktail signature : rhum, jus d'ananas local, coco et sirop de gingembre.", price: 5000, siteId: site.id, isActive: true } });
  const cocktail2 = await prisma.dish.create({ data: { name: "Sundown Abidjan", category: "Bar", description: "Gin, jus de bissap frais, sirop de citron vert, eau pétillante et menthe fraîche.", price: 4500, siteId: site.id, isActive: true } });
  const wine = await prisma.dish.create({ data: { name: "Verre de Vin Rouge (Bordeaux)", category: "Bar", description: "Château sélectionné de Bordeaux, servi à température idéale.", price: 6000, siteId: site.id, isActive: true } });

  await prisma.dishComponent.createMany({
    data: [
      { name: "Attiéké", type: "GARNISH", optional: false, dishId: dish1.id },
      { name: "Riz blanc", type: "GARNISH", optional: true, dishId: dish1.id },
      { name: "Alloco", type: "GARNISH", optional: true, dishId: dish2.id },
      { name: "Piment rouge doux", type: "SAUCE", optional: true, dishId: dish2.id },
      { name: "Viande de bœuf supplémentaire", type: "PROTEIN", optional: true, dishId: dish3.id },
      { name: "Frites", type: "GARNISH", optional: true, dishId: dish5.id },
      { name: "Salade fraîche", type: "GARNISH", optional: true, dishId: dish5.id },
      { name: "Sauce piment maison", type: "SAUCE", optional: true, dishId: dish4.id },
    ],
  });
  console.log("✓ Menu restaurant & bar");

  // ── 12. Commandes F&B ─────────────────────────────────────────────────────
  const orders = [
    { type: "RESTAURANT", table: "Table N° 3", status: "SERVED", total: 15500, items: [{ dish: dish1, qty: 1, price: 8500 }, { dish: dish2, qty: 1, price: 7000 }] },
    { type: "RESTAURANT", table: "Table N° 7", status: "PAID", total: 25500, items: [{ dish: dish4, qty: 1, price: 9500 }, { dish: dish5, qty: 2, price: 7500 }] },
    { type: "BAR", table: "Pool Bar - Terrasse", status: "PAID", total: 14500, items: [{ dish: cocktail1, qty: 2, price: 5000 }, { dish: beerItem, qty: 2, price: 2000 }, { dish: cocktail2, qty: 1, price: 4500 }] },
    { type: "RESTAURANT", table: "Table N° 12", status: "PENDING", total: 16000, items: [{ dish: dish6, qty: 1, price: 8000 }, { dish: dish3, qty: 1, price: 6500 }, { dish: beerItem, qty: 1, price: 2000 }] },
    { type: "BAR", table: "Salon VIP Lounge", status: "SERVED", total: 18000, items: [{ dish: wine, qty: 2, price: 6000 }, { dish: cocktail1, qty: 1, price: 5000 }, { dish: cocktail2, qty: 1, price: 4500 }] },
    { type: "RESTAURANT", table: "Table N° 2", status: "PAID", total: 19000, items: [{ dish: dish1, qty: 1, price: 8500 }, { dish: dish4, qty: 1, price: 9500 }] },
  ];
  for (const o of orders) {
    const order = await prisma.order.create({ data: { type: o.type, tableNumber: o.table, status: o.status, totalPrice: o.total } });
    await prisma.orderItem.createMany({ data: o.items.map(i => ({ orderId: order.id, dishId: i.dish.id, dishName: i.dish.name, quantity: i.qty, price: i.price })) });
  }
  console.log("✓ Commandes F&B");

  // ── 13. Salles de réception ───────────────────────────────────────────────
  const hall1 = await prisma.receptionHall.create({ data: { name: "Grand Salon Djiboua", capacity: 300, pricePerHour: 50000, description: "Grande salle modulable pour mariages, galas et congrès d'entreprise. Sonorisation et éclairage inclus.", image: "salle de reception.jpg" } });
  const hall2 = await prisma.receptionHall.create({ data: { name: "Salon VIP Lagune", capacity: 80, pricePerHour: 25000, description: "Salle de conférence de prestige avec vue panoramique, équipements de visio-conférence HD.", image: "salle de reception2.jpg" } });

  await prisma.hallBooking.createMany({
    data: [
      { hallId: hall1.id, clientName: "Groupement Inter-Écoles CI", clientPhone: "+225 05 55 44 33 22", eventDate: new Date("2026-06-12T09:00:00Z"), durationHours: 8, totalPrice: 400000, status: "CONFIRMED" },
      { hallId: hall2.id, clientName: "Ministère de la Transition Digitale", clientPhone: "+225 07 77 88 99 00", eventDate: new Date("2026-06-20T14:00:00Z"), durationHours: 4, totalPrice: 100000, status: "PENDING" },
      { hallId: hall1.id, clientName: "Mariage Kouamé & Diabaté", clientPhone: "+225 01 02 03 04 05", eventDate: new Date("2026-06-28T10:00:00Z"), durationHours: 12, totalPrice: 600000, status: "CONFIRMED" },
      { hallId: hall2.id, clientName: "Cabinet KPMG Côte d'Ivoire", clientPhone: "+225 27 22 50 00 00", eventDate: new Date("2026-07-05T08:00:00Z"), durationHours: 6, totalPrice: 150000, status: "PENDING" },
    ],
  });
  console.log("✓ Salles & réservations");

  // ── 14. Réservations hébergement ─────────────────────────────────────────
  const rooms = await prisma.room.findMany({ include: { roomType: true } });
  const getRoomByNum = (num: string) => rooms.find(r => r.number === num)!;

  const reservationsData = [
    { client: client1, room: getRoomByNum("201"), checkIn: new Date("2026-06-03"), checkOut: new Date("2026-06-08"), status: "CONFIRMED", checkInStatus: "CHECKED_IN" },
    { client: client2, room: getRoomByNum("112"), checkIn: new Date("2026-06-05"), checkOut: new Date("2026-06-07"), status: "CONFIRMED", checkInStatus: "CHECKED_IN" },
    { client: client3, room: getRoomByNum("401"), checkIn: new Date("2026-06-04"), checkOut: new Date("2026-06-10"), status: "CONFIRMED", checkInStatus: "KYC_SUBMITTED" },
    { client: client4, room: getRoomByNum("117"), checkIn: new Date("2026-06-05"), checkOut: new Date("2026-06-06"), status: "CONFIRMED", checkInStatus: "CHECKED_IN" },
    { client: client5, room: getRoomByNum("301"), checkIn: new Date("2026-06-01"), checkOut: new Date("2026-06-07"), status: "CONFIRMED", checkInStatus: "KYC_SUBMITTED" },
    { client: client6, room: getRoomByNum("206"), checkIn: new Date("2026-06-05"), checkOut: new Date("2026-06-09"), status: "CONFIRMED", checkInStatus: "CHECKED_IN" },
    { client: client7, room: getRoomByNum("501"), checkIn: new Date("2026-06-03"), checkOut: new Date("2026-06-11"), status: "CONFIRMED", checkInStatus: "KYC_SUBMITTED" },
    { client: client8, room: getRoomByNum("127"), checkIn: new Date("2026-06-04"), checkOut: new Date("2026-06-06"), status: "CONFIRMED", checkInStatus: "CHECKED_IN" },
    // Futures réservations
    { client: client1, room: getRoomByNum("303"), checkIn: new Date("2026-06-15"), checkOut: new Date("2026-06-18"), status: "PENDING", checkInStatus: "NOT_STARTED" },
    { client: client4, room: getRoomByNum("402"), checkIn: new Date("2026-06-20"), checkOut: new Date("2026-06-22"), status: "PENDING", checkInStatus: "NOT_STARTED" },
  ];

  for (const rd of reservationsData) {
    const diffTime = Math.abs(rd.checkOut.getTime() - rd.checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * rd.room.roomType.price;
    const res = await prisma.reservation.create({
      data: { checkIn: rd.checkIn, checkOut: rd.checkOut, roomId: rd.room.id, clientId: rd.client.id, status: rd.status, checkInStatus: rd.checkInStatus, totalPrice },
    });
    // KYC pour les clients en cours de séjour
    if (rd.checkInStatus === "KYC_SUBMITTED" || rd.checkInStatus === "CHECKED_IN") {
      await prisma.kycData.create({
        data: { reservationId: res.id, idType: "CNI", idNumber: `CI-2024-${Math.floor(Math.random() * 900000 + 100000)}`, idExpiry: new Date("2028-12-31") },
      });
    }
    // Transaction pour les réservations confirmées
    if (rd.status === "CONFIRMED") {
      await prisma.transaction.create({
        data: { amount: totalPrice, type: "PAYMENT", status: "PAID", description: `Hébergement — ${rd.client.name} — Chambre ${rd.room.number}`, userId: rd.client.id, category: "RESERVATION" },
      });
    }
  }
  console.log("✓ Réservations hébergement");

  // ── 15. Demandes Conciergerie ─────────────────────────────────────────────
  await prisma.conciergeRequest.createMany({
    data: [
      { type: "ROOM_SERVICE", status: "PENDING", description: "Commande repas en chambre : Kédjénou + eau minérale", roomNumber: "201", site: "Hôtel Astoria Palace" },
      { type: "MAINTENANCE", status: "IN_PROGRESS", description: "Climatisation chambre 112 — bruit anormal signalé par client", roomNumber: "112", site: "Hôtel Astoria Palace" },
      { type: "TOWELS", status: "COMPLETED", description: "Remplacement serviettes de bain demandé", roomNumber: "301", site: "Hôtel Astoria Palace" },
      { type: "WAKE_UP_CALL", status: "COMPLETED", description: "Réveil à 06h30 demandé pour vol 09h15 AIBD", roomNumber: "117", site: "Hôtel Astoria Palace" },
      { type: "ROOM_SERVICE", status: "IN_PROGRESS", description: "Plateau petit déjeuner continental + café allongé", roomNumber: "401", site: "Hôtel Astoria Palace" },
      { type: "TAXI", status: "PENDING", description: "Réservation taxi pour 14h00 direction Plateau-Abidjan", roomNumber: "206", site: "Hôtel Astoria Palace" },
      { type: "MAINTENANCE", status: "PENDING", description: "Ampoule grillée dans la salle de bain", roomNumber: "127", site: "Hôtel Astoria Palace" },
      { type: "ROOM_SERVICE", status: "SERVED", description: "Bouteille de champagne Moët & Chandon + fruits de saison", roomNumber: "501", site: "Hôtel Astoria Palace" },
    ],
  });
  console.log("✓ Demandes conciergerie");

  // ── 16. Avis clients ──────────────────────────────────────────────────────
  const reviews = [
    { user: client1, rating: 5, category: "Service", comment: "Service impeccable, personnel aux petits soins. Je recommande vivement l'Astoria Palace !" },
    { user: client2, rating: 4, category: "Chambre", comment: "Chambre propre et bien équipée. Vue sur la piscine magnifique. RAS." },
    { user: client3, rating: 5, category: "Restaurant", comment: "Le Kédjénou est exceptionnel ! La meilleure version que j'ai goûtée à Abidjan. Bravo au chef !" },
    { user: client5, rating: 5, category: "Piscine", comment: "La piscine est sublime, l'eau à la bonne température. Les transats sont confortables." },
    { user: client6, rating: 4, category: "Chambre", comment: "Suite Exécutive très spacieuse. Jacuzzi parfait. Petit bémol sur le bruit de la rue la nuit." },
    { user: client7, rating: 5, category: "Service", comment: "Séjour de rêve dans la Suite Présidentielle. Le majordome Kofi est aux petits soins !" },
    { user: client8, rating: 3, category: "Restaurant", comment: "Cuisine correcte mais délais de service un peu longs le soir. À améliorer." },
    { user: client4, rating: 5, category: "Service", comment: "Accueil chaleureux dès l'arrivée, check-in rapide. On reviendra avec plaisir." },
  ];
  for (const rv of reviews) {
    await prisma.review.create({ data: { userId: rv.user.id, rating: rv.rating, category: rv.category, comment: rv.comment } });
  }
  console.log("✓ Avis clients");

  // ── 17. Comptabilité (Transactions) ───────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      // Revenus F&B
      { amount: 15500,  type: "PAYMENT", status: "PAID", description: "F&B Restaurant — Table 3 — Dîner (Kédjénou + Attiéké)", category: "FNB" },
      { amount: 25500,  type: "PAYMENT", status: "PAID", description: "F&B Restaurant — Table 7 — Thieboudienne + Brochettes x2", category: "FNB" },
      { amount: 14500,  type: "PAYMENT", status: "PAID", description: "F&B Bar — Pool Bar Terrasse — Cocktails & Bières", category: "FNB" },
      { amount: 18000,  type: "PAYMENT", status: "PAID", description: "F&B Bar — Salon VIP Lounge — Vins & Cocktails", category: "FNB" },
      { amount: 19000,  type: "PAYMENT", status: "PAID", description: "F&B Restaurant — Table 2 — Kédjénou + Thieboudienne", category: "FNB" },
      // Revenus événements
      { amount: 400000, type: "PAYMENT", status: "PAID", description: "Location Salle Djiboua — Groupement Inter-Écoles CI", category: "EVENTS" },
      { amount: 100000, type: "INVOICE", status: "PENDING", description: "Location Salon VIP — Ministère Transition Digitale", category: "EVENTS" },
      { amount: 600000, type: "INVOICE", status: "PENDING", description: "Location Salle Djiboua — Mariage Kouamé & Diabaté", category: "EVENTS" },
      // Revenus services
      { amount: 35000,  type: "PAYMENT", status: "PAID", description: "Transfert aéroport — Client Valérie Assi", category: "FNB" },
      { amount: 50000,  type: "PAYMENT", status: "PAID", description: "Massages bien-être x2 — Spa Astoria", category: "FNB" },
      // Charges salariales
      { amount: -480000, type: "EXPENSE", status: "PAID", description: "Salaire — Jean-Baptiste Kouamé (Chef Cuisine)", category: "SALARY" },
      { amount: -220000, type: "EXPENSE", status: "PAID", description: "Salaire — Aïssatou Diallo (Réceptionniste Principale)", category: "SALARY" },
      { amount: -215000, type: "EXPENSE", status: "PAID", description: "Salaire — Traore Awa (Réceptionniste)", category: "SALARY" },
      { amount: -210000, type: "EXPENSE", status: "PAID", description: "Salaire — Koné Adama (Barman)", category: "SALARY" },
      { amount: -195000, type: "EXPENSE", status: "PAID", description: "Salaire — Bogui Franck (Maintenance)", category: "SALARY" },
      { amount: -180000, type: "EXPENSE", status: "PAID", description: "Salaire — Marie-Claire Yao (Gouvernante)", category: "SALARY" },
      { amount: -160000, type: "EXPENSE", status: "PAID", description: "Salaire — Ouattara Mamadou (Sécurité)", category: "SALARY" },
      // Charges fixes
      { amount: -185000, type: "EXPENSE", status: "PAID", description: "Abonnement Électricité CIE — Mai 2026", category: "UTILITIES" },
      { amount: -42000,  type: "EXPENSE", status: "PAID", description: "Abonnement Internet Fibre Orange CI", category: "UTILITIES" },
      { amount: -28000,  type: "EXPENSE", status: "PAID", description: "Abonnement Eau SODECI — Mai 2026", category: "UTILITIES" },
      // Approvisionnements
      { amount: -95000,  type: "EXPENSE", status: "PAID", description: "Achat Linge — Draps & serviettes (lot 50)", category: "RESTOCK" },
      { amount: -145000, type: "EXPENSE", status: "PAID", description: "Approvisionnement F&B — Marché Adjamé + Grand Surface", category: "RESTOCK" },
      { amount: -62000,  type: "EXPENSE", status: "PAID", description: "Approvisionnement Bar — Vins, Spiritueux, Bières", category: "RESTOCK" },
      { amount: -35000,  type: "EXPENSE", status: "PAID", description: "Produits d'entretien et ménagers (mensuel)", category: "RESTOCK" },
    ],
  });
  console.log("✓ Comptabilité");

  // ── 18. Offres promotionnelles ────────────────────────────────────────────
  await prisma.promoOffer.createMany({
    data: [
      {
        title: "Escapade Romantique Week-end",
        description: "Offrez-vous un séjour inoubliable : décoration florale de chambre personnalisée, cocktail de bienvenue au Pool Bar, dîner aux chandelles aux saveurs ivoiriennes et petit déjeuner gourmand inclus pour deux personnes.",
        discountPct: 15,
        promoCode: "ROMANCE15",
        image: "suite2.jpg",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: "Offre Détente Lagon — Junior Suite",
        description: "20% de réduction sur nos Junior Suites avec accès illimité à l'espace aquatique lagon, jacuzzi privatif et une session de massage bien-être de 30 minutes offerte.",
        discountPct: 20,
        promoCode: "LAGON20",
        image: "piscine2.jpg",
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: "Happy Hour Pool Bar — Vendredi & Samedi",
        description: "Pour chaque cocktail signature Astoria commandé, le second vous est offert ! Profitez de cette offre exclusive tous les vendredis et samedis soirs à partir de 18h00 au bord de la piscine.",
        discountPct: 50,
        promoCode: "HAPPYBAR",
        image: "bar3.jpg",
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: "Séjour Affaires — Suite Exécutive",
        description: "Pack Business : Suite Exécutive avec bureau équipé, accès rapide à la salle de conférence, petit déjeuner continental inclus et transfert aéroport gratuit. Idéal pour les déplacements professionnels.",
        discountPct: 10,
        promoCode: "BUSINESS10",
        image: "suite.jpg",
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });

  // ── 19. Événements de l'hôtel ─────────────────────────────────────────────
  await prisma.hotelEvent.createMany({
    data: [
      {
        title: "Soirée Grillade & Jazz au Lagon",
        description: "Une ambiance feutrée portée par un saxophoniste jazz invité, autour d'un somptueux buffet de brochettes, langoustes grillées et cocktails tropicaux. Réservez votre table dès maintenant !",
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        price: 15000,
        image: "bar2.jpg",
        isActive: true,
      },
      {
        title: "Grand Brunch du Terroir Ivoirien",
        description: "Découvrez notre carte gastronomique sous forme de buffet à volonté : kédjénous mijotés, poissons braisés, alloco doré, gâteaux locaux et jus de fruits frais. Un voyage culinaire au cœur de la Côte d'Ivoire.",
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        price: 18000,
        image: "restaurent.jpg",
        isActive: true,
      },
      {
        title: "Soirée Karaoké & Bulles VIP",
        description: "Libérez votre passion pour le chant dans le cadre élégant du Salon VIP Lagune. Coupe de champagne de bienvenue offerte, prix pour les meilleures interprétations. L'événement incontournable du mois !",
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        price: 20000,
        image: "karaoke.jpg",
        isActive: true,
      },
      {
        title: "Pool Party Tropicale — Fête de l'Indépendance",
        description: "Célébrez la fête nationale en grande pompe ! DJ set, animations aquatiques, buffet barbecue géant et feux d'artifice au bord de la piscine. Entrée en formule tout inclus.",
        eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        price: 25000,
        image: "piscine.jpg",
        isActive: true,
      },
    ],
  });

  console.log("✓ Promotions & événements");
  console.log("\n🎉 Seeding terminé avec succès ! Hôtel Astoria Palace est prêt.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
