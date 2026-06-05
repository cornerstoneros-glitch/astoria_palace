/**
 * startup.js — Script de démarrage pour environnements de production
 *
 * Ce script est exécuté AVANT next start.
 * Il s'assure que :
 *   1. Les migrations Prisma sont appliquées (tables créées)
 *   2. La base de données est peuplée si elle est vide (seed)
 *   3. Next.js est lancé en mode production
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = __dirname;

function run(cmd, label) {
  console.log(`\n[startup] ▶ ${label}...`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: rootDir });
    console.log(`[startup] ✓ ${label} terminé.`);
  } catch (err) {
    console.error(`[startup] ✗ Échec: ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}

async function main() {
  // 1. Appliquer les migrations (crée les tables si elles n'existent pas)
  run("npx prisma migrate deploy", "Prisma migrate deploy");

  // 2. Vérifier si la DB est vide (seed uniquement si nécessaire)
  //    On vérifie en comptant les sites — si 0, on seed.
  try {
    const { PrismaClient } = require("@prisma/client");
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

    const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    const prisma = new PrismaClient({ adapter });

    const siteCount = await prisma.site.count();
    await prisma.$disconnect();

    if (siteCount === 0) {
      console.log("\n[startup] ▶ Base de données vide — lancement du seed...");
      run("npx tsx prisma/seed.ts", "Prisma seed");
    } else {
      console.log(`\n[startup] ℹ DB déjà peuplée (${siteCount} site(s)) — seed ignoré.`);
    }
  } catch (err) {
    console.warn("[startup] ⚠ Impossible de vérifier le seed:", err.message);
    // Ne pas bloquer le démarrage si la vérification échoue
  }

  // 3. Lancer Next.js
  console.log("\n[startup] ▶ Démarrage de Next.js...\n");
  const next = spawn("npx", ["next", "start", "-p", process.env.PORT || "3000"], {
    stdio: "inherit",
    cwd: rootDir,
    env: { ...process.env },
  });

  next.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("[startup] Erreur fatale:", err);
  process.exit(1);
});
