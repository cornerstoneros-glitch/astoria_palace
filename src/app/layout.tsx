import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://astoriapalace.ci"),
  title: "Hôtel Astoria Palace — Complexe Hôtelier 4 Étoiles à Abidjan",
  description: "Système de Gestion Hôtelière Intégré (SGHI) de l'Hôtel Astoria Palace, Yopougon, Côte d'Ivoire. Hébergement de standing supérieur, restauration raffinée, loisirs et événements d'exception.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Hôtel Astoria Palace — Complexe Hôtelier 4 Étoiles",
    description: "Hébergement de standing supérieur, restauration raffinée, loisirs et événements d'exception à Yopougon, Abidjan.",
    images: [{ url: "/logo.jpg", width: 800, height: 450, alt: "Logo Hôtel Astoria Palace" }],
    locale: "fr_CI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-800 font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
