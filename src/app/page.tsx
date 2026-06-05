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
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-sans selection:bg-amber-500/30 selection:text-amber-400">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2c3e6b]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#b8860b]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0c10]/80 border-b border-[#1e293b] px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold tracking-widest uppercase font-serif">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span className="text-xl font-extrabold tracking-wider font-serif bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            ASTORIA PALACE
          </span>
          <span className="text-[10px] text-slate-500 tracking-widest uppercase font-sans">
            Yopougon, Abidjan
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#chambres" className="hover:text-amber-400 transition-colors">Nos Chambres</a>
          <a href="#gastronomie" className="hover:text-amber-400 transition-colors">Gastronomie</a>
          <a href="#services" className="hover:text-amber-400 transition-colors">Loisirs & Salles</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold">
            Portail Gestion (SGHI)
            <span className="text-xs">→</span>
          </Link>
        </nav>

        <Link 
          href="/dashboard" 
          className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-sans shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition-all"
        >
          Accéder au Dashboard
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Prestige & Hospitalité en Côte d'Ivoire
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold font-serif tracking-tight text-white mb-6 leading-tight max-w-4xl">
          L'Élégance Contemporaine au Cœur de{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            Yopougon
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Découvrez un refuge raffiné alliant suites de grand standing, table gastronomique ivoirienne, piscine lagon et espaces événementiels d'exception.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a 
            href="#chambres" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-semibold bg-slate-900 border border-[#2c3e6b] text-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
          >
            Explorer les Hébergements
          </a>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans shadow-lg shadow-amber-500/15 transition-all hover:-translate-y-0.5"
          >
            Gérer les Réservations (SGHI)
          </Link>
        </div>
      </section>

      {/* CHAMBRES SECTION */}
      <section id="chambres" className="px-6 lg:px-16 py-20 bg-[#07090d]/60 border-t border-[#131924]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Hébergement</p>
              <h2 className="text-3xl font-bold font-serif text-white">Chambres & Suites d'Exception</h2>
            </div>
            <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
              Chacune de nos 70 chambres a été pensée pour vous offrir un confort absolu et une sérénité totale avec des équipements de standing supérieur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((type) => (
              <div 
                key={type.id} 
                className="group flex flex-col rounded-xl overflow-hidden bg-[#10141f]/80 border border-[#1e293b] hover:border-amber-500/30 transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Simulated Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-[#1b2538] to-[#0c0e14] flex items-center justify-center overflow-hidden border-b border-[#1e293b]">
                  <div className="absolute inset-0 bg-[#2c3e6b]/15 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-5xl font-serif text-slate-700/50 select-none uppercase tracking-widest">
                    {type.name.split(' ').pop()}
                  </span>
                  
                  {/* Floating Price tag */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#0a0c10]/90 border border-amber-500/20 text-xs font-bold text-amber-400 tracking-wide">
                    {type.price.toLocaleString("fr-FR")} FCFA <span className="text-[10px] text-slate-400 font-normal">/ nuit</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
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
                      Max {type.capacity} personnes
                    </span>
                    <span className="text-amber-500 font-semibold group-hover:underline">Voir détails</span>
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
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Fine Dining</p>
              <h2 className="text-3xl font-bold font-serif text-white">L'Art Culinaire Ivoirien</h2>
            </div>
            <p className="text-slate-400 max-w-md mt-4 md:mt-0 text-sm">
              Notre restaurant principal propose une cuisine locale raffinée alliant saveurs traditionnelles et techniques contemporaines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div 
                key={dish.id} 
                className="group rounded-xl overflow-hidden bg-[#10141f]/40 border border-[#1a202c] hover:border-amber-500/20 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#b8860b]/25 text-amber-300 border border-amber-500/20">
                      {dish.category}
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-serif">
                      {dish.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-400 transition-colors mb-2">
                    {dish.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1e293b] flex flex-wrap gap-1.5">
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
      <section id="services" className="px-6 lg:px-16 py-20 bg-[#07090d]/60 border-t border-[#131924]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Espaces & Loisirs</p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white leading-tight mb-6">
                Un Complexe de Loisirs & d'Événements Unique à Yopougon
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                En plus de nos hébergements, profitez de notre magnifique piscine extérieure et réservez nos salles de prestige pour vos réceptions, banquets ou séminaires professionnels.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-[#10141f] border border-[#1e293b]">
                    <h4 className="text-xs font-bold text-slate-300 mb-1">{service.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{service.description}</p>
                    <span className="text-xs font-bold text-amber-400 font-serif">
                      {service.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-tr from-[#1b2538] to-[#0a0c10] border border-[#1e293b] flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-[#2c3e6b]/20 opacity-60" />
              <div className="z-10 text-center px-8">
                <span className="text-6xl mb-4 block">🏊</span>
                <h3 className="text-lg font-serif font-bold text-white mb-2">Espace Lagon & Pool Bar</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Notre bar piscine propose des rafraîchissements et grillades au transat tout au long de la journée pour résidents et visiteurs extérieurs.
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
            <a href="#" className="hover:text-slate-300 transition-colors">Politique de Confidentialité</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Conditions Générales</a>
            <Link href="/dashboard" className="text-amber-500 hover:text-amber-400 font-bold">Portail Interne SGHI</Link>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Hôtel Astoria Palace. Tous droits réservés.</span>
            <span className="block mt-0.5 text-[10px] text-slate-600">Réf: CDC-ASTORIA-SGHI-001</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
