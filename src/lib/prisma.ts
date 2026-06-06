/**
 * src/lib/prisma.ts
 *
 * Initialise le schéma SQLite de façon synchrone AVANT de créer le client Prisma.
 * Ceci garantit que les tables existent quel que soit le mode de démarrage du serveur.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ─── Résolution du chemin DB ────────────────────────────────────────────────

function getDbPath(): string {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const filePath = url.replace(/^file:/, "");
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath);
}

// ─── Schéma SQL complet (CREATE TABLE IF NOT EXISTS) ────────────────────────

const SCHEMA_SQL = `
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
  "cleaningStatus" TEXT NOT NULL DEFAULT 'CLEAN',
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

CREATE TABLE IF NOT EXISTS "LoyaltyProgram" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "points" INTEGER NOT NULL DEFAULT 0,
  "tier" TEXT NOT NULL DEFAULT 'STANDARD',
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

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

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "KycData_reservationId_key" ON "KycData"("reservationId");
CREATE UNIQUE INDEX IF NOT EXISTS "GuestPreferences_userId_key" ON "GuestPreferences"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyProgram_userId_key" ON "LoyaltyProgram"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Staff_userId_key" ON "Staff"("userId");
`;

// ─── Colonnes ajoutées après la migration initiale ───────────────────────────
// SQLite ne supporte pas ALTER TABLE IF NOT EXISTS — on gère l'erreur manuellement.

const COLUMN_MIGRATIONS = [
  `ALTER TABLE "RoomType" ADD COLUMN "image" TEXT`,
  `ALTER TABLE "Staff" ADD COLUMN "salary" REAL NOT NULL DEFAULT 150000`,
  `ALTER TABLE "Staff" ADD COLUMN "contractType" TEXT NOT NULL DEFAULT 'CDI'`,
  `ALTER TABLE "Staff" ADD COLUMN "shift" TEXT NOT NULL DEFAULT 'Matin (06h - 14h)'`,
  `ALTER TABLE "Staff" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE'`,
  `ALTER TABLE "Transaction" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL'`,
];


function ensureSchema(): void {
  try {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // 1. Créer les tables manquantes
    db.exec(SCHEMA_SQL);

    // 2. Ajouter les colonnes manquantes sur des tables existantes
    for (const migration of COLUMN_MIGRATIONS) {
      try {
        db.prepare(migration).run();
      } catch {
        // Colonne déjà existante — ignoré silencieusement
      }
    }

    db.close();
  } catch (err: any) {
    console.error("[prisma] Avertissement init schéma:", err?.message);
  }
}

// Exécuté UNE FOIS à l'import du module (côté serveur uniquement)
if (typeof window === "undefined") {
  ensureSchema();
}

// ─── Client Prisma ────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter });
}

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaInstance = createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
