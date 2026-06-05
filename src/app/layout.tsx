import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hôtel Astoria Palace — Complexe Hôtelier de Luxe à Abidjan",
  description: "Système de Gestion Hôtelière Intégré (SGHI) de l'Hôtel Astoria Palace, Yopougon, Côte d'Ivoire. Hébergement de standing supérieur, restauration raffinée, loisirs et événements d'exception.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0d0f14] text-slate-100 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
