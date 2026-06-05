import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingWidget from "./components/BookingWidget";
import LoyaltySignupForm from "./components/LoyaltySignupForm";
import FaqAccordion from "./components/FaqAccordion";

export const revalidate = 0;

// Map d'images par catégorie de plat
const dishImages: Record<string, string> = {
  "Signature": "/restaurent.jpg",
  "Tradition": "/restaurent2.jpg",
  "Terroir":   "/restaurent3.jpg",
  "Prestige":  "/restaurent open_space.jpg",
  "Grillade":  "/cuisine.jpg",
  "Bar":       "/bar.jpg",
};

export default async function Home() {
  const dishes = await prisma.dish.findMany({
    take: 6,
    where: { isActive: true, category: { not: "Bar" } },
    include: { components: true },
    orderBy: { category: "asc" }
  });

  const services = await prisma.service.findMany({
    take: 6,
    orderBy: { price: "desc" }
  });

  const now = new Date();
  const promotions = await prisma.promoOffer.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { createdAt: "desc" }
  });

  const events = await prisma.hotelEvent.findMany({
    where: { isActive: true, eventDate: { gte: now } },
    orderBy: { eventDate: "asc" }
  });

  const reviews = await prisma.review.findMany({
    where: { rating: { gte: 4 } },
    take: 6,
    include: {
      user: {
        select: {
          name: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#c5a059]/20 selection:text-[#c5a059]">

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 px-6 lg:px-16 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Hôtel Astoria Palace Logo" className="h-12 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1 hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight font-serif text-[#0f172a] leading-tight">ASTORIA PALACE</span>
            <div className="flex items-center gap-0.5 text-[10px] text-[#c5a059] font-bold">
              <span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-500 font-sans tracking-normal ml-2 lowercase">Hôtel 4 Étoiles</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#hero" className="hover:text-[#0d5ca3] transition-colors">Accueil</a>
          <a href="#chambres" className="hover:text-[#0d5ca3] transition-colors">Hébergements</a>
          <a href="#gastronomie" className="hover:text-[#0d5ca3] transition-colors">Gastronomie</a>
          <a href="#services" className="hover:text-[#0d5ca3] transition-colors">Loisirs & Salles</a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <Link href="/dashboard" className="text-[#c5a059] hover:text-[#b08b45] transition-colors flex items-center gap-1.5 font-black">
            Portail SGHI <span className="text-xs">→</span>
          </Link>
        </nav>

        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all">
          Espace Gestion
        </Link>
      </header>

      {/* ─── HERO BANNER ────────────────────────────────────────────────────── */}
      <section id="hero" className="relative w-full h-screen min-h-[620px] max-h-[900px] flex items-center justify-center overflow-hidden">
        {/* Background image with parallax effect */}
        <img
          src="/large_vue.jpg"
          alt="Hôtel Astoria Palace — Vue d'ensemble"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
        {/* Subtle gold shimmer at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-xs text-[#d4af37] font-bold mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
            Votre Havre de Prestige à Yopougon, Abidjan
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-serif tracking-tight text-white mb-6 leading-[1.1]">
            L'Excellence Africaine<br />
            <span className="bg-gradient-to-r from-[#c5a059] via-[#d4af37] to-[#c5a059] bg-clip-text text-transparent">
              au Cœur d'Abidjan
            </span>
          </h1>

          <p className="text-slate-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Cadre d'hébergement exceptionnel de standing 4 étoiles, gastronomie ivoirienne raffinée, piscine lagon et salons événementiels de prestige.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="#chambres" className="px-8 py-3.5 rounded-lg font-bold bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              Réserver ma Chambre
            </a>
            <a href="#gastronomie" className="px-8 py-3.5 rounded-lg font-bold bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5">
              Découvrir l'Hôtel
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
            {[
              { value: "77", label: "Chambres & Suites" },
              { value: "4★", label: "Étoiles" },
              { value: "300", label: "Places événements" },
              { value: "24/7", label: "Service Conciergerie" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-3xl font-black font-serif text-[#c5a059]">{s.value}</span>
                <span className="text-xs text-slate-300 font-semibold mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
          <span className="text-[10px] tracking-widest uppercase font-semibold">Défiler</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* ─── GALERIE RAPIDE ─────────────────────────────────────────────────── */}
      <section className="w-full grid grid-cols-2 md:grid-cols-4 h-64 md:h-80">
        {[
          { src: "/suite presidentielle.jpg", label: "Suites Présidentielles" },
          { src: "/piscine2.jpg", label: "Espace Piscine Lagon" },
          { src: "/restaurent2.jpg", label: "Restaurant Gastronomique" },
          { src: "/salle de reception.jpg", label: "Salles Événementielles" },
        ].map((img) => (
          <div key={img.src} className="relative overflow-hidden group cursor-pointer">
            <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors" />
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-slate-900/60 rounded-full backdrop-blur-sm">
                {img.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ─── BOOKING / DISPONIBILITÉS ───────────────────────────────────────── */}
      <section id="chambres" className="px-6 lg:px-16 py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Prestige & Confort</p>
              <h2 className="text-3xl font-bold font-serif text-slate-900">Réservations en Temps Réel</h2>
            </div>
            <p className="text-slate-600 max-w-md mt-4 md:mt-0 text-sm">
              Consultez les disponibilités de nos 77 hébergements en direct et réservez instantanément.
            </p>
          </div>

          <BookingWidget />

          {/* Rassurance Badges */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-b border-slate-100 py-8">
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-xl text-[#b08b45] group-hover:scale-110 transition-transform">🏆</div>
              <span className="font-bold text-xs text-slate-800 mt-2 block">Meilleur Tarif Garanti</span>
              <span className="text-[10px] text-slate-450 leading-relaxed max-w-40">Directement sur le site officiel de l'hôtel</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-xl text-[#b08b45] group-hover:scale-110 transition-transform">💳</div>
              <span className="font-bold text-xs text-slate-800 mt-2 block">Paiements Flexibles</span>
              <span className="text-[10px] text-slate-450 leading-relaxed max-w-40">Mobile Money (Orange/MTN/Moov) & Cartes</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-xl text-[#b08b45] group-hover:scale-110 transition-transform">🔄</div>
              <span className="font-bold text-xs text-slate-800 mt-2 block">Annulation Souple</span>
              <span className="text-[10px] text-slate-450 leading-relaxed max-w-40">Modifiez votre séjour sans frais jusqu'à 24h</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-xl text-[#b08b45] group-hover:scale-110 transition-transform">🛎️</div>
              <span className="font-bold text-xs text-slate-800 mt-2 block">Concierge & Sécurité</span>
              <span className="text-[10px] text-slate-450 leading-relaxed max-w-40">Assistance 24h/24 et parking surveillé</span>
            </div>
          </div>

          {/* Types de chambres visuels */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { src: "/chambre.jpg", name: "Chambre Standard", price: "35 000 FCFA" },
              { src: "/chambre2.jpg", name: "Chambre Supérieure", price: "50 000 FCFA" },
              { src: "/suite.jpg", name: "Junior Suite", price: "75 000 FCFA" },
              { src: "/suite2.jpg", name: "Suite Exécutive", price: "120 000 FCFA" },
              { src: "/suite presidentielle.jpg", name: "Suite Présidentielle", price: "250 000 FCFA" },
            ].map((rt) => (
              <div key={rt.src} className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-[#c5a059]/50 hover:shadow-lg transition-all cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={rt.src} alt={rt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-[11px] font-bold leading-tight">{rt.name}</p>
                  <p className="text-[#c5a059] text-[10px] font-black mt-0.5">{rt.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GASTRONOMIE ────────────────────────────────────────────────────── */}
      <section id="gastronomie" className="px-6 lg:px-16 py-20 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          {/* Header with restaurant banner */}
          <div className="relative rounded-2xl overflow-hidden mb-12 h-48 md:h-64 group">
            <img src="/restaurent open_space.jpg" alt="Restaurant Astoria Palace" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: "center 40%" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-12">
              <div>
                <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-1">Gastronomie 4 Étoiles</p>
                <h2 className="text-2xl md:text-4xl font-bold font-serif text-white leading-tight">Notre Table de Prestige</h2>
                <p className="text-slate-300 text-sm mt-2 max-w-md">Carte locale raffinée, portée par des produits frais de Côte d'Ivoire.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => {
              const imgSrc = dishImages[dish.category] || "/restaurent.jpg";
              return (
                <div key={dish.id} className="group rounded-xl overflow-hidden bg-white border border-slate-200/80 hover:border-[#c5a059]/40 hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    <img src={imgSrc} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#c5a059] text-slate-950">{dish.category}</span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="text-sm font-black text-white font-serif drop-shadow-lg">{dish.price?.toLocaleString("fr-FR")} F</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0d5ca3] transition-colors mb-2">{dish.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed flex-1">{dish.description}</p>
                    {dish.components.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {dish.components.map((comp) => (
                          <span key={comp.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{comp.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar / Pool section */}
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { src: "/bar.jpg", label: "Bar Tropical", desc: "Cocktails signature & spiritueux sélectionnés" },
              { src: "/bar2.jpg", label: "Pool Bar Lagon", desc: "Boissons fraîches au bord de l'eau" },
              { src: "/bar3.jpg", label: "Soirées à Thème", desc: "Événements musicaux & Happy Hours" },
            ].map((b) => (
              <div key={b.src} className="relative rounded-xl overflow-hidden h-40 group">
                <img src={b.src} alt={b.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-slate-900/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <h4 className="text-white font-bold text-sm">{b.label}</h4>
                  <p className="text-slate-300 text-[11px] mt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OFFRES & ÉVÉNEMENTS ────────────────────────────────────────────── */}
      <section id="marketing" className="px-6 lg:px-16 py-20 bg-slate-100 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Offres & Actualités</p>
              <h2 className="text-3xl font-bold font-serif text-slate-900">Offres Exclusives & Événements</h2>
            </div>
            <p className="text-slate-600 max-w-md mt-4 md:mt-0 text-sm">
              Profitez de réductions exceptionnelles et ne manquez pas nos soirées à thème.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Promotions */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <span>🎁</span> Offres Spéciales & Réductions
              </h3>
              {promotions.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400">Aucune offre disponible en ce moment.</div>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="rounded-xl bg-white border border-slate-200 hover:border-[#c5a059]/40 hover:shadow-sm transition-all overflow-hidden group">
                      {promo.image && (
                        <div className="relative h-32 overflow-hidden">
                          <img src={`/${promo.image}`} alt={promo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                          {promo.discountPct && (
                            <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 text-xs font-black rounded-full shadow">
                              -{promo.discountPct}%
                            </div>
                          )}
                          <h4 className="absolute bottom-3 left-4 text-white font-bold text-sm">{promo.title}</h4>
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <p className="text-[11px] text-slate-600 leading-relaxed">{promo.description}</p>
                        <div className="flex flex-wrap items-center gap-2.5">
                          {promo.promoCode && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] font-black text-[#b08b45] tracking-wider">
                              Code: {promo.promoCode}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 font-medium">Jusqu'au {new Date(promo.endDate).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Événements */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <span>📅</span> Événements à l'Affiche
              </h3>
              {events.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400">Aucun événement programmé.</div>
              ) : (
                <div className="space-y-4">
                  {events.map((evt) => (
                    <div key={evt.id} className="rounded-xl bg-white border border-slate-200 hover:border-[#0d5ca3]/30 hover:shadow-sm transition-all overflow-hidden group">
                      {evt.image && (
                        <div className="relative h-32 overflow-hidden">
                          <img src={`/${evt.image}`} alt={evt.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                          <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-11 h-13 bg-white/20 border border-white/40 rounded-lg backdrop-blur-sm p-1.5 text-white font-bold">
                            <span className="text-[9px] uppercase">{new Date(evt.eventDate).toLocaleDateString("fr-FR", { month: "short" })}</span>
                            <span className="text-base font-extrabold leading-none">{new Date(evt.eventDate).getDate()}</span>
                          </div>
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <h4 className="text-white font-bold text-sm">{evt.title}</h4>
                            <span className="text-[#c5a059] text-xs font-black">{evt.price > 0 ? `${evt.price.toLocaleString("fr-FR")} F` : "Libre"}</span>
                          </div>
                        </div>
                      )}
                      <div className="p-4 space-y-1">
                        <p className="text-[11px] text-slate-600 leading-relaxed">{evt.description}</p>
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>🕒 {new Date(evt.eventDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="text-[#0d5ca3] hover:underline cursor-pointer">Infos : +225 07 00 00 00 00</span>
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

      {/* ─── LOISIRS & WELLNESS ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Bien-être & Loisirs</p>
            <h2 className="text-3xl font-bold font-serif text-slate-900">Équipements & Espaces de Détente</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/Piscine.jpg", label: "Piscine Lagon", icon: "🏊" },
              { src: "/gym.jpg", label: "Salle de Sport", icon: "💪" },
              { src: "/jaccuzi.jpg", label: "Jacuzzi & Spa", icon: "♨️" },
              { src: "/jardin paysager.jpg", label: "Jardin Paysager", icon: "🌿" },
              { src: "/terras_promenade.jpg", label: "Terrasse Vue", icon: "🌅" },
              { src: "/couloir.jpg", label: "Espaces Communs", icon: "✨" },
              { src: "/parking.jpg", label: "Parking Sécurisé", icon: "🚗" },
              { src: "/reception.jpg", label: "Réception 24/7", icon: "🛎️" },
            ].map((am) => (
              <div key={am.src} className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer">
                <img src={am.src} alt={am.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                  <span className="text-2xl mb-1">{am.icon}</span>
                  <span className="text-white text-[11px] font-bold">{am.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES / SALLES ──────────────────────────────────────────────── */}
      <section id="services" className="px-6 lg:px-16 py-20 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Détente & Séminaires</p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-tight mb-6">
                Piscine Lagon & Salles Événementielles d'Exception
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Réservez nos espaces modulables (de 40 à 300 personnes) pour vos séminaires, conférences ou cérémonies, et profitez de l'accès lagon.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0d5ca3]/20 transition-colors">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{service.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{service.description}</p>
                    <span className="text-xs font-bold text-[#0d5ca3] font-serif">{service.price?.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg group">
                <img src="/salle de reception.jpg" alt="Grand Salon Djiboua" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-base font-serif font-bold">Grand Salon Djiboua</h3>
                  <p className="text-xs text-slate-300">Capacité 300 personnes — 50 000 FCFA/h</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src="/salle de reception2.jpg" alt="Salon VIP Lagune" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-[11px] font-bold">Salon VIP Lagune</p>
                    <p className="text-[10px] text-slate-300">80 personnes</p>
                  </div>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src="/piscine3.jpg" alt="Pool Bar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-[11px] font-bold">Pool Bar</p>
                    <p className="text-[10px] text-slate-300">Accès 5 000 FCFA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES / PROUVE SOCIALE ───────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20 bg-slate-100/50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Preuve de notre excellence</p>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-tight mb-12">
            Ce que disent nos clients
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#0d5ca3]/10 text-[#0d5ca3] border border-[#0d5ca3]/20 uppercase">
                      {rev.category || "Hôtel"}
                    </span>
                    <span className="text-[#b08b45] text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm font-semibold italic leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <span className="block font-bold text-slate-900 text-xs uppercase font-serif">
                    {rev.user?.name || "Client vérifié"}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Séjour en {new Date(rev.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLUB FIDÉLITÉ (LOYALTY) ────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Club Privé Astoria</p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-tight">
                Rejoignez le Club & Profitez d'avantages exclusifs
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Devenez membre dès aujourd'hui pour cumuler des points à chaque séjour, sur vos repas et vos événements, et débloquez des surclassements et privilèges exclusifs.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[#0d5ca3] text-sm">✨ Nuitées Gratuites</span>
                  <span className="text-slate-500 text-[10px] font-normal mt-1 block">Convertissez vos points en séjours de rêve</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[#c5a059] text-sm">👑 Surclassements VIP</span>
                  <span className="text-slate-500 text-[10px] font-normal mt-1 block">Accès prioritaire aux Suites Présidentielles</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[#0d5ca3] text-sm">🍳 Petit Déjeuner Offert</span>
                  <span className="text-slate-500 text-[10px] font-normal mt-1 block">Inclus dès le niveau Silver du club</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[#c5a059] text-sm">✈️ Transfert Privé</span>
                  <span className="text-slate-500 text-[10px] font-normal mt-1 block">Navette aéroport offerte pour nos membres Gold</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <LoyaltySignupForm />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-2">Des questions ?</p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">Foire Aux Questions</h2>
            <p className="text-slate-550 text-xs md:text-sm mt-2 font-semibold">Toutes les informations pratiques indispensables pour votre prochain séjour à l'Astoria Palace.</p>
          </div>
          
          <FaqAccordion />
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-900 px-6 lg:px-16 py-12 text-slate-400">
        {/* Top footer with image strip */}
        <div className="max-w-6xl mx-auto mb-8 grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
          {["/balcon_chambre.jpg", "/bain.jpg", "/douche presidentielle.jpg", "/terras_promenade2.jpg"].map((src) => (
            <div key={src} className="h-20 overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity" />
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg opacity-80" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">HÔTEL ASTORIA PALACE</span>
              <span className="mt-0.5 text-slate-500">Yopougon — Abidjan, Côte d'Ivoire</span>
              <span className="text-slate-500">+225 07 00 00 00 00 · contact@astoriapalace.ci</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <Link href="/dashboard" className="text-[#c5a059] hover:text-[#d4af37] font-bold">Portail SGHI →</Link>
          </div>

          <div className="text-center md:text-right">
            <span>© {new Date().getFullYear()} Hôtel Astoria Palace.</span>
            <span className="block mt-0.5 text-[10px] text-slate-500">Réf: CDC-ASTORIA-SGHI-001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
