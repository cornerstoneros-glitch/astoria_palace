"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LuxuryHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-16 py-3.5 flex items-center justify-between transition-all duration-500 ${
        scrolled 
          ? "backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <img 
          src="/logo.jpg" 
          alt="Hôtel Astoria Palace Logo" 
          className={`h-12 w-auto object-contain rounded-lg border p-1 hover:scale-105 transition-all duration-500 ${
            scrolled ? "border-slate-200 bg-white" : "border-white/20 bg-white/10 backdrop-blur-sm"
          }`} 
        />
        <div className="flex flex-col">
          <span className={`text-lg font-black tracking-tight font-serif leading-tight transition-colors duration-500 ${
            scrolled ? "text-[#0f172a]" : "text-white"
          }`}>
            ASTORIA PALACE
          </span>
          <div className="flex items-center gap-0.5 text-[10px] text-[#c5a059] font-bold">
            <span>★</span><span>★</span><span>★</span><span>★</span>
            <span className={`font-sans tracking-normal ml-2 lowercase transition-colors duration-500 ${
              scrolled ? "text-slate-500" : "text-slate-200"
            }`}>
              Hôtel 4 Étoiles
            </span>
          </div>
        </div>
      </div>

      <nav className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors duration-500 ${
        scrolled ? "text-slate-600" : "text-white/90 drop-shadow-md"
      }`}>
        <a href="#hero" className={`transition-colors ${scrolled ? "hover:text-[#0d5ca3]" : "hover:text-[#c5a059]"}`}>Accueil</a>
        <a href="#chambres" className={`transition-colors ${scrolled ? "hover:text-[#0d5ca3]" : "hover:text-[#c5a059]"}`}>Hébergements</a>
        <a href="#gastronomie" className={`transition-colors ${scrolled ? "hover:text-[#0d5ca3]" : "hover:text-[#c5a059]"}`}>Gastronomie</a>
        <a href="#services" className={`transition-colors ${scrolled ? "hover:text-[#0d5ca3]" : "hover:text-[#c5a059]"}`}>Loisirs & Salles</a>
        <span className={`w-1.5 h-1.5 rounded-full ${scrolled ? "bg-slate-300" : "bg-white/40"}`} />
        <Link href="/dashboard" className="text-[#c5a059] hover:text-[#b08b45] transition-colors flex items-center gap-1.5 font-black">
          Portail SGHI <span className="text-xs">→</span>
        </Link>
      </nav>

      <Link href="/dashboard" className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-500 shadow-md ${
        scrolled 
          ? "bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95" 
          : "bg-white text-[#0d5ca3] hover:bg-slate-50 active:scale-95"
      }`}>
        Espace Gestion
      </Link>
    </header>
  );
}
