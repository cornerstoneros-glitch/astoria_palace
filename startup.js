/**
 * startup.js — Initialisation DB + démarrage Next.js
 *
 * Stratégie : utilise better-sqlite3 directement pour créer les tables
 * avec CREATE TABLE IF NOT EXISTS — fiable, sans CLI Prisma, sans npm.
 * Next.js démarre TOUJOURS même si l'init DB échoue.
 */

// Charger les variables d'environnement
try { require("dotenv").config(); } catch (e) { /* dotenv optionnel */ }

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = __dirname;

// Résoudre le chemin absolu de la DB depuis DATABASE_URL
function getDbPath() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  // Extraire le chemin du format "file:/absolute/path" ou "file:./relative"
  const filePath = url.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(rootDir, filePath);
}

// Toutes les instructions SQL pour créer le schéma complet
const INIT_SQL = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "Site" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CLIENT',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "RoomType" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" REAL NOT NULL,
  "capacity" INTEGER NOT NULL,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Room" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "number" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "roomTypeId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id"),
  FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);

CREATE TABLE IF NOT EXISTS "Reservation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "checkIn" DATETIME NOT NULL,
  "checkOut" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "checkInStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "totalPrice" REAL NOT NULL,
  "roomId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id"),
  FOREIGN KEY ("clientId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "KycData" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "idType" TEXT NOT NULL,
  "idNumber" TEXT NOT NULL,
  "idExpiry" DATETIME,
  "idImage" TEXT,
  "reservationId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "KycData_reservationId_key" ON "KycData"("reservationId");

CREATE TABLE IF NOT EXISTS "GuestPreferences" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pillowType" TEXT,
  "beverages" TEXT,
  "cleaningTime" TEXT,
  "dietaryNotes" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GuestPreferences_userId_key" ON "GuestPreferences"("userId");

CREATE TABLE IF NOT EXISTS "LoyaltyProgram" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "points" INTEGER NOT NULL DEFAULT 0,
  "tier" TEXT NOT NULL DEFAULT 'STANDARD',
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyProgram_userId_key" ON "LoyaltyProgram"("userId");

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "amount" REAL NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "userId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "ConciergeRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "description" TEXT,
  "roomNumber" TEXT NOT NULL,
  "site" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "category" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "Staff" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "salary" REAL NOT NULL DEFAULT 150000,
  "contractType" TEXT NOT NULL DEFAULT 'CDI',
  "shift" TEXT NOT NULL DEFAULT 'Matin (06h - 14h)',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id"),
  FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Staff_userId_key" ON "Staff"("userId");

CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" REAL,
  "siteId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);

CREATE TABLE IF NOT EXISTS "InventoryItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "quantity" REAL NOT NULL,
  "unit" TEXT NOT NULL,
  "minThreshold" REAL NOT NULL DEFAULT 5,
  "siteId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);

CREATE TABLE IF NOT EXISTS "Dish" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "price" REAL,
  "image" TEXT,
  "siteId" TEXT NOT NULL,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);

CREATE TABLE IF NOT EXISTS "DishComponent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "optional" INTEGER NOT NULL DEFAULT 0,
  "dishId" TEXT NOT NULL,
  FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL DEFAULT 'RESTAURANT',
  "tableNumber" TEXT,
  "roomNumber" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "totalPrice" REAL NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "dishId" TEXT NOT NULL,
  "dishName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" REAL NOT NULL,
  "orderId" TEXT NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ReceptionHall" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "pricePerHour" REAL NOT NULL,
  "description" TEXT,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HallBooking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "hallId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientPhone" TEXT NOT NULL,
  "eventDate" DATETIME NOT NULL,
  "durationHours" INTEGER NOT NULL,
  "totalPrice" REAL NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("hallId") REFERENCES "ReceptionHall"("id")
);

CREATE TABLE IF NOT EXISTS "SystemSetting" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PromoOffer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "discountPct" REAL,
  "promoCode" TEXT,
  "image" TEXT,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HotelEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "eventDate" DATETIME NOT NULL,
  "price" REAL NOT NULL DEFAULT 0,
  "image" TEXT,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

function initDatabase() {
  const dbPath = getDbPath();
  console.log(`[startup] DB path: ${dbPath}`);

  // Créer le répertoire si nécessaire
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`[startup] Répertoire DB créé: ${dbDir}`);
  }

  try {
    const Database = require("better-sqlite3");
    const db = new Database(dbPath);

    // Exécuter chaque statement séparément
    const statements = INIT_SQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    for (const stmt of statements) {
      if (stmt.startsWith("PRAGMA")) continue; // déjà exécutés
      try {
        db.prepare(stmt).run();
      } catch (e) {
        // Ignorer les erreurs d'index déjà existants, etc.
        if (!e.message.includes("already exists")) {
          console.warn(`[startup] SQL warning: ${e.message}`);
        }
      }
    }

    // Vérifier si on doit seed
    const siteCount = db.prepare("SELECT COUNT(*) as count FROM Site").get();
    db.close();

    if (siteCount.count === 0) {
      console.log("[startup] ✓ Tables créées — lancement du seed...");
      return true; // need seed
    } else {
      console.log(`[startup] ✓ DB OK (${siteCount.count} site(s))`);
      return false;
    }
  } catch (err) {
    console.error("[startup] ✗ Erreur init DB:", err.message);
    return false;
  }
}

function runSeed() {
  const { execSync } = require("child_process");
  try {
    console.log("[startup] ▶ Seed en cours...");
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      cwd: rootDir,
      env: { ...process.env },
      timeout: 120000,
    });
    console.log("[startup] ✓ Seed terminé.");
  } catch (err) {
    console.warn("[startup] ⚠ Seed échoué (non bloquant):", err.message);
  }
}

function startNextJs() {
  console.log("\n[startup] ▶ Démarrage Next.js production...\n");
  const port = process.env.PORT || "3000";
  const next = spawn("node", [path.join(rootDir, "node_modules/.bin/next"), "start", "-p", port], {
    stdio: "inherit",
    cwd: rootDir,
    env: { ...process.env },
  });
  next.on("close", (code) => process.exit(code ?? 0));
  next.on("error", (err) => {
    console.error("[startup] Next.js erreur:", err.message);
    process.exit(1);
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────
const needsSeed = initDatabase();
if (needsSeed) runSeed();
startNextJs();
