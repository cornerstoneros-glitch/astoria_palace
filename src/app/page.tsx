import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Disable caching for server side rendering

export default async function Home() {
  // Fetch dynamic items from SQLite database
  const roomTypes = await prisma.roomType.findMany({
    orderBy: { price: "asc" }
  });

  const dishes = await prisma.dish.findMany({
    take: 3,
    include: { components: true },
    orderBy: { category: "asc" }
  });

  const services = await prisma.service.findMany({
    take: 4,
    orderBy: { price: "desc" }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#07090d] text-[#e2e8f0] font-sans selection:bg-[#c5a059]/30 selection:text-[#c5a059]">
      
      {/* BRAND GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0d5ca3]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090d]/90 border-b border-[#1b2538] px-6 lg:px-16 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Brand Logo Image */}
          <img 
            src="/logo.jpg" 
            alt="Hôtel Astoria Palace Logo" 
            className="h-12 w-auto object-contain rounded-lg border border-[#1b2538] bg-white p-1 hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight font-serif text-white leading-tight">
              ASTORIA PALACE
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-[#c5a059] font-bold">
              <span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-500 font-sans tracking-normal ml-2 lowercase">Hôtel 4 Étoiles</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#chambres" className="hover:text-[#c5a059] transition-colors">Hébergements</a>
          <a href="#gastronomie" className="hover:text-[#c5a059] transition-colors">Gastronomie</a>
          <a href="#services" className="hover:text-[#c5a059] transition-colors">Loisirs & Salles</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <Link href="/dashboard" className="text-[#c5a059] hover:text-[#d4af37] transition-colors flex items-center gap-1.5 font-bold">
            Portail SGHI
            <span className="text-xs">→</span>
          </Link>
        </nav>

        <Link 
          href="/dashboard" 
          className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white font-sans shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all"
        >
          Espace Gestion
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-xs text-[#c5a059] font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
          Votre Havre de Prestige à Yopougon
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-white mb-6 leading-tight max-w-4xl">
          L'Alliance du Confort & de la Tradition à{" "}
          <span className="bg-gradient-to-r from-[#c5a059] via-amber-200 to-[#c5a059] bg-clip-text text-transparent">
            L'Astoria Palace
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Profitez d'un cadre exceptionnel d'hébergement 4 étoiles, de notre table gastronomique, de notre piscine lagon et de nos salons événementiels de prestige.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a 
            href="#chambres" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-semibold bg-slate-900 border border-[#0d5ca3]/30 text-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
          >
            Découvrir nos Chambres
          </a>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-semibold bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 font-sans shadow-lg shadow-amber-500/15 transition-all hover:-translate-y-0.5"
          >
            Système Intégré (SGHI)
          </Link>
        </div>
      </section>

      {/* CHAMBRES SECTION */}
      <section id="chambres" className="px-6 lg:px-16 py-20 bg-[#0c0f16]/60 border-t border-[#131924]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Prestige & Confort</p>
              <h2 className="text-3xl font-bold font-serif text-white">Nos Chambres & Suites</h2>
            </div>
            <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
              70 clés de grand standing équipées de climatisation renforcée, TV 4K, Wi-Fi très haut débit et espaces détente privatifs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((type) => (
              <div 
                key={type.id} 
                className="group flex flex-col rounded-xl overflow-hidden bg-[#0e121a] border border-[#1b2538] hover:border-[#0d5ca3]/40 transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Simulated Image Placeholder with Primary Brand Blue gradient */}
                <div className="relative h-48 bg-gradient-to-br from-[#0d5ca3]/15 to-[#080a0f] flex items-center justify-center overflow-hidden border-b border-[#1b2538]">
                  <div className="absolute inset-0 bg-[#0d5ca3]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-4xl font-serif text-slate-600/30 select-none uppercase tracking-widest">
                    ★ ★ ★ ★
                  </span>
                  
                  {/* Floating Price tag */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#07090d]/95 border border-[#c5a059]/20 text-xs font-bold text-[#c5a059] tracking-wide">
                    {type.price.toLocaleString("fr-FR")} FCFA <span className="text-[10px] text-slate-400 font-normal">/ nuit</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors mb-2">
                      {type.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {type.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1e293b] text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Capacité : {type.capacity} pers.
                    </span>
                    <span className="text-[#c5a059] font-semibold group-hover:underline">Réserver</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESTAURANT SECTION */}
      <section id="gastronomie" className="px-6 lg:px-16 py-20 border-t border-[#131924]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Gastronomie 4 Étoiles</p>
              <h2 className="text-3xl font-bold font-serif text-white">Notre Table de Prestige</h2>
            </div>
            <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
              Découvrez notre carte locale raffinée, portée par des produits frais de Côte d'Ivoire et de la sous-région.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div 
                key={dish.id} 
                className="group rounded-xl overflow-hidden bg-[#0f131c]/60 border border-[#1b2538] hover:border-[#c5a059]/20 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/20">
                      {dish.category}
                    </span>
                    <span className="text-sm font-bold text-[#c5a059] font-serif">
                      {dish.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-[#c5a059] transition-colors mb-2">
                    {dish.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1b2538] flex flex-wrap gap-1.5">
                  {dish.components.map((comp) => (
                    <span key={comp.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {comp.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES / AMENITIES */}
      <section id="services" className="px-6 lg:px-16 py-20 bg-[#0c0f16]/60 border-t border-[#131924]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Détente & Séminaires</p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white leading-tight mb-6">
                Piscine Lagon & Salles Événementielles d'Exception
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Réservez nos espaces modulables (de 40 à 300 personnes) pour vos séminaires, conférences ou cérémonies de mariage, et profitez de l'accès lagon.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-[#0e121a] border border-[#1b2538] hover:border-[#0d5ca3]/20 transition-colors">
                    <h4 className="text-xs font-bold text-slate-300 mb-1">{service.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{service.description}</p>
                    <span className="text-xs font-bold text-[#c5a059] font-serif">
                      {service.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-tr from-[#0d5ca3]/20 to-[#07090d] border border-[#1b2538] flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-[#0d5ca3]/10 opacity-60 animate-pulse" />
              <div className="z-10 text-center px-8">
                <span className="text-6xl mb-4 block">🏊</span>
                <h3 className="text-lg font-serif font-bold text-white mb-2">Espace Aquatique & Pool Bar</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Grillades au transat, cocktails tropicaux et relaxation totale au bord de l'eau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#131924] bg-[#05070a] px-6 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-slate-400 text-sm">HÔTEL ASTORIA PALACE</span>
            <span className="mt-1">Yopougon — Abidjan, Côte d'Ivoire</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Conditions d'Utilisation</a>
            <Link href="/dashboard" className="text-[#c5a059] hover:text-[#d4af37] font-bold">Portail Interne SGHI</Link>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Hôtel Astoria Palace. Tous droits réservés.</span>
            <span className="block mt-0.5 text-[10px] text-slate-600">Document Réf: CDC-ASTORIA-SGHI-001</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
