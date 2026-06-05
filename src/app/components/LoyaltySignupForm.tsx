"use client";

import { useState } from "react";

export default function LoyaltySignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess(data.message);
        setName("");
        setEmail("");
      } else {
        setError(data.message || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) {
      setError("Impossible de joindre le serveur. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
      <div className="flex flex-col gap-1 text-left">
        <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Nom complet</label>
        <input 
          type="text" 
          required 
          placeholder="Ex: Roger Traoré" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Adresse e-mail</label>
        <input 
          type="email" 
          required 
          placeholder="Ex: roger.traore@gmail.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
        />
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 text-left">
          🎉 {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 text-left">
          ⚠️ {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 hover:brightness-105 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-md disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          "Rejoindre le Club Astoria"
        )}
      </button>
    </form>
  );
}
