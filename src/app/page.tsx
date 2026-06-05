import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingWidget from "./components/BookingWidget";

export const revalidate = 0; // Disable caching for server side rendering

export default async function Home() {
  // Fetch dynamic items from SQLite database
  const dishes = await prisma.dish.findMany({
    take: 3,
    include: { components: true },
    orderBy: { category: "asc" }
  });

  const services = await prisma.service.findMany({
    take: 4,
    orderBy: { price: "desc" }
  });

  const now = new Date();
  const promotions = await prisma.promoOffer.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    },
    orderBy: { createdAt: "desc" }
  });

  const events = await prisma.hotelEvent.findMany({
    where: {
      isActive: true,
      eventDate: { gte: now }
    },
    orderBy: { eventDate: "asc" }
  });



  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#c5a059]/20 selection:text-[#c5a059]">
      
      {/* BRAND GLOW DECORATIONS (SUBTLE ON LIGHT THEME) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0d5ca3]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#c5a059]/3 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 px-6 lg:px-16 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {/* Brand Logo Image */}
          <img 
            src="/logo.jpg" 
            alt="Hôtel Astoria Palace Logo" 
            className="h-12 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1 hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight font-serif text-[#0f172a] leading-tight">
              ASTORIA PALACE
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-[#c5a059] font-bold">
              <span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-500 font-sans tracking-normal ml-2 lowercase">Hôtel 4 Étoiles</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#chambres" className="hover:text-[#0d5ca3] transition-colors">Hébergements</a>
          <a href="#gastronomie" className="hover:text-[#0d5ca3] transition-colors">Gastronomie</a>
          <a href="#services" className="hover:text-[#0d5ca3] transition-colors">Loisirs & Salles</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <Link href="/dashboard" className="text-[#c5a059] hover:text-[#b08b45] transition-colors flex items-center gap-1.5 font-black">
            Portail SGHI
            <span className="text-xs">→</span>
          </Link>
        </nav>

        <Link 
          href="/dashboard" 
          className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white font-sans shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all"
        >
          Espace Gestion
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-xs text-[#b08b45] font-bold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
          Votre Havre de Prestige à Yopougon
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl">
          L'Alliance du Confort & de la Tradition à{" "}
          <span className="bg-gradient-to-r from-[#0d5ca3] via-[#1e40af] to-[#0d5ca3] bg-clip-text text-transparent">
            L'Astoria Palace
          </span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Profitez d'un cadre d'hébergement exceptionnel de standing 4 étoiles, de notre table gastronomique, de notre piscine lagon et de nos salons événementiels de prestige.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a 
            href="#chambres" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            Découvrir nos Chambres
          </a>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg font-bold bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 font-sans shadow-lg shadow-amber-500/10 transition-all hover:-translate-y-0.5"
          >
            Système Intégré (SGHI)
          </Link>
        </div>
      </section>

      {/* CHAMBRES SECTION */}
      <section id="chambres" className="px-6 lg:px-16 py-20 bg-white border-t border-slate-200/70 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Prestige & Confort</p>
              <h2 className="text-3xl font-bold font-serif text-slate-900">Recherche & Réservations en Temps Réel</h2>
            </div>
            <p className="text-slate-650 max-w-md mt-4 md:mt-0 text-sm">
              Consultez les disponibilités de nos 77 hébergements en direct et réservez instantanément votre séjour de prestige.
            </p>
          </div>

          <BookingWidget />
        </div>
      </section>

      {/* RESTAURANT SECTION */}
      <section id="gastronomie" className="px-6 lg:px-16 py-20 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Gastronomie 4 Étoiles</p>
              <h2 className="text-3xl font-bold font-serif text-slate-900">Notre Table de Prestige</h2>
            </div>
            <p className="text-slate-600 max-w-md mt-4 md:mt-0 text-sm">
              Découvrez notre carte locale raffinée, portée par des produits frais de Côte d'Ivoire et de la sous-région.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div 
                key={dish.id} 
                className="group rounded-xl overflow-hidden bg-white border border-slate-200/80 hover:border-[#c5a059]/40 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#c5a059]/10 text-[#b08b45] border border-[#c5a059]/20">
                      {dish.category}
                    </span>
                    <span className="text-sm font-bold text-[#0d5ca3] font-serif">
                      {dish.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d5ca3] transition-colors mb-2">
                    {dish.name}
                  </h3>
                  
                  <p className="text-xs text-slate-650 leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {dish.components.map((comp) => (
                    <span key={comp.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {comp.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFRES & EVENEMENTS */}
      <section id="marketing" className="px-6 lg:px-16 py-20 bg-slate-100 border-t border-slate-200/80 shadow-inner">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Offres & Actualités</p>
              <h2 className="text-3xl font-bold font-serif text-slate-900">Offres Exclusives & Événements</h2>
            </div>
            <p className="text-slate-650 max-w-md mt-4 md:mt-0 text-sm">
              Profitez de réductions exceptionnelles pour vos nuitées et ne manquez pas nos soirées à thème au bord de la piscine.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Promotions Side */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <span>🎁</span> Offres Spéciales & Réductions
              </h3>
              
              {promotions.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                  Aucune offre spéciale disponible en ce moment. Revenez bientôt !
                </div>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div 
                      key={promo.id} 
                      className="p-5 rounded-xl bg-white border border-slate-200 hover:border-[#c5a059]/40 hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden group"
                    >
                      {/* Discount Tag */}
                      {promo.discountPct && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-bl-lg shadow-sm">
                          -{promo.discountPct}%
                        </div>
                      )}
                      
                      {promo.image && (
                        <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img src={`/${promo.image}`} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-slate-900">{promo.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{promo.description}</p>
                        
                        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                          {promo.promoCode && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-black text-[#b08b45] tracking-wider">
                              Code: {promo.promoCode}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 font-medium">
                            Jusqu'au {new Date(promo.endDate).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events Side */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <span>📅</span> Événements à l'Affiche
              </h3>

              {events.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                  Aucun événement programmé pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="p-5 rounded-xl bg-white border border-slate-200 hover:border-[#0d5ca3]/30 hover:shadow-sm transition-all flex items-start gap-4 group"
                    >
                      {/* Date block */}
                      <div className="flex flex-col items-center justify-center w-12 h-14 bg-[#0d5ca3]/5 text-[#0d5ca3] border border-[#0d5ca3]/20 rounded-lg shrink-0 py-1.5 font-bold">
                        <span className="text-xs uppercase tracking-tight">
                          {new Date(evt.eventDate).toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                        <span className="text-base font-serif font-extrabold leading-tight">
                          {new Date(evt.eventDate).getDate()}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0d5ca3] transition-colors">{evt.title}</h4>
                          <span className="text-[10px] font-black text-[#b08b45] font-serif">
                            {evt.price > 0 ? `${evt.price.toLocaleString("fr-FR")} F` : "Entrée Libre"}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-600 leading-relaxed">{evt.description}</p>
                        
                        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>🕒 {new Date(evt.eventDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="text-[#0d5ca3] hover:underline cursor-pointer">Réservation : +225 07 00 00 00 00</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SERVICES / AMENITIES */}
      <section id="services" className="px-6 lg:px-16 py-20 bg-white border-t border-slate-200/70 shadow-sm">

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Détente & Séminaires</p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-tight mb-6">
                Piscine Lagon & Salles Événementielles d'Exception
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Réservez nos espaces modulables (de 40 à 300 personnes) pour vos séminaires, conférences ou cérémonies de mariage, et profitez de l'accès lagon.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0d5ca3]/20 transition-colors">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{service.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{service.description}</p>
                    <span className="text-xs font-bold text-[#0d5ca3] font-serif">
                      {service.price?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg group">
              <img 
                src="/Piscine.jpg" 
                alt="Espace Aquatique & Pool Bar" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-70 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10 text-white">
                <span className="text-5xl mb-3 block">🏊</span>
                <h3 className="text-lg font-serif font-bold mb-2">Espace Aquatique & Pool Bar</h3>
                <p className="text-xs text-slate-200 max-w-sm mx-auto leading-relaxed font-medium">
                  Grillades au transat, cocktails tropicaux et relaxation totale au bord de l'eau.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-850 bg-slate-900 px-6 lg:px-16 py-12 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-white text-sm">HÔTEL ASTORIA PALACE</span>
            <span className="mt-1">Yopougon — Abidjan, Côte d'Ivoire</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions d'Utilisation</a>
            <Link href="/dashboard" className="text-[#c5a059] hover:text-[#d4af37] font-bold">Portail Interne SGHI</Link>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Hôtel Astoria Palace. Tous droits réservés.</span>
            <span className="block mt-0.5 text-[10px] text-slate-500">Document Réf: CDC-ASTORIA-SGHI-001</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
