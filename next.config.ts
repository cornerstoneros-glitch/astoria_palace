import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling native Node.js modules.
  // better-sqlite3 contains prebuilt C++ binaries that must be loaded
  // via Node require() at runtime — bundling them breaks deployment.
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/client",
  ],
};

export default nextConfig;
