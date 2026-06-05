"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form submission handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate login success since AUTH_ENABLED is currently false
    setTimeout(() => {
      // Set mock cookie for demonstration
      document.cookie = "session_token=mock-admin-token; path=/; max-age=3600";
      setLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  // Direct bypass handler
  const handleBypass = (role: "ADMIN" | "STAFF" | "CLIENT") => {
    setLoading(true);
    // Set custom mock cookie
    document.cookie = `session_token=mock-${role.toLowerCase()}-token; path=/; max-age=3600`;
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden items-center justify-center p-4">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0d5ca3]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c5a059]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 md:p-10 shadow-xl relative z-10 transition-all">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="Hôtel Astoria Palace Logo" 
            className="h-16 w-auto object-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm mb-4" 
          />
          <h1 className="text-2xl font-black tracking-wider font-serif text-[#0f172a] uppercase">
            Astoria Palace
          </h1>
          <div className="flex items-center gap-0.5 text-[10px] text-[#c5a059] font-bold mt-1">
            <span>★</span><span>★</span><span>★</span><span>★</span>
            <span className="text-slate-500 font-sans tracking-normal ml-2 lowercase">Hôtel 4 Étoiles</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 max-w-xs">
            Authentification requise pour l'Espace de Gestion Interne (SGHI)
          </p>
        </div>

        {/* Global Access Control Bypassed Warning Badge */}
        <div className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-250 text-xs text-amber-800 leading-relaxed shadow-sm">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-900">
            <span className="text-sm">🔑</span>
            <span>Accès Intégré (Mode Démo)</span>
          </div>
          La gestion stricte des accès est actuellement <strong className="text-amber-950 font-black">désactivée</strong>. Vous pouvez saisir n'importe quel identifiant ou utiliser les raccourcis de contournement ci-dessous pour accéder au portail.
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-650 font-medium">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Adresse E-mail
            </label>
            <input 
              type="email" 
              placeholder="ex: admin@astoriapalace.ci" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Mot de passe
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white font-sans shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Se Connecter"
            )}
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-3 text-slate-400 font-bold">Ou Contourner</span>
          </div>
        </div>

        {/* Bypass Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleBypass("ADMIN")}
            disabled={loading}
            className="p-3 text-left rounded-xl border border-slate-200 hover:border-[#c5a059] hover:bg-amber-50/20 transition-all group active:scale-95"
          >
            <span className="block text-xs font-black text-slate-800 group-hover:text-[#b08b45]">Directeur</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Simuler Admin</span>
          </button>

          <button 
            onClick={() => handleBypass("STAFF")}
            disabled={loading}
            className="p-3 text-left rounded-xl border border-slate-200 hover:border-[#0d5ca3] hover:bg-blue-50/10 transition-all group active:scale-95"
          >
            <span className="block text-xs font-black text-slate-800 group-hover:text-[#0d5ca3]">Réceptionniste</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Simuler Staff</span>
          </button>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button 
            onClick={() => router.push("/")}
            className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
          >
            Retourner au site principal
          </button>
        </div>

      </div>

      {/* Footer copyright */}
      <p className="text-[10px] text-slate-400 mt-8 relative z-10 text-center">
        © {new Date().getFullYear()} Hôtel Astoria Palace — Système de Gestion de Haute Intégrité.
      </p>
    </div>
  );
}
