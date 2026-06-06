"use client";

import { useEffect, useState } from "react";

export default function LuxuryHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="hero" className="relative w-full h-screen min-h-[620px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      <div 
        className={`absolute inset-0 w-full h-full transition-transform duration-[20000ms] ease-out ${
          mounted ? "scale-105" : "scale-100"
        }`}
      >
        <img
          src="/large_vue.jpg"
          alt="Hôtel Astoria Palace — Vue d'ensemble"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/80" />
      
      {/* Subtle gold shimmer at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-80" />

      {/* CSS Particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-[#c5a059] rounded-full opacity-0 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-16">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-xs text-[#d4af37] font-bold mb-6 backdrop-blur-sm transition-all duration-1000 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
          Votre Havre de Prestige à Yopougon, Abidjan
        </div>

        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black font-serif tracking-tight text-white mb-6 leading-[1.1] transition-all duration-1000 delay-300 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          L'Excellence Africaine<br />
          <span className="bg-gradient-to-r from-[#c5a059] via-[#d4af37] to-[#c5a059] bg-clip-text text-transparent">
            au Cœur d'Abidjan
          </span>
        </h1>

        <p className={`text-slate-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 transition-all duration-1000 delay-500 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          Cadre d'hébergement exceptionnel de standing 4 étoiles, gastronomie ivoirienne raffinée, piscine lagon et salons événementiels de prestige.
        </p>

        <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-700 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <a href="#chambres" className="px-8 py-3.5 rounded-lg font-bold bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
            Réserver ma Chambre
          </a>
          <a href="#gastronomie" className="px-8 py-3.5 rounded-lg font-bold bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5">
            Découvrir l'Hôtel
          </a>
        </div>

        {/* Stats row */}
        <div className={`mt-12 flex flex-wrap justify-center gap-8 text-white transition-all duration-1000 delay-1000 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
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
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce transition-all duration-1000 delay-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <span className="text-[10px] tracking-widest uppercase font-semibold">Défiler</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </section>
  );
}
