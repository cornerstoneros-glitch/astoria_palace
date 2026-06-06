"use client";

import { useState, useEffect, use } from "react";

export default function MobileCheckinPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React's `use` hook as required in modern Next.js
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kycForm, setKycForm] = useState({
    idType: "CNI",
    idNumber: "",
    idExpiry: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchRes() {
      try {
        const res = await fetch(`/api/reservations/${id}`);
        const data = await res.json();
        if (data.status === "error") throw new Error(data.message);
        
        setReservation(data.data);
        
        // If already submitted
        if (data.data.checkInStatus === "KYC_SUBMITTED" || data.data.kycData) {
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || "Réservation introuvable.");
      } finally {
        setLoading(false);
      }
    }
    fetchRes();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reservations/${id}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycForm),
      });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      
      setSuccess(true);
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl mb-4">✕</div>
        <h1 className="text-xl font-serif font-bold text-slate-900 mb-2">Lien Invalide</h1>
        <p className="text-sm text-slate-500">{error || "Cette réservation n'existe pas."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[40px] shadow-lg relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
        </div>
        <h1 className="text-2xl font-serif font-bold relative z-10 text-[#c5a059]">Astoria Palace</h1>
        <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 relative z-10">Pré-enregistrement Mobile</p>
      </div>

      <div className="flex-1 px-5 -mt-6 relative z-20 pb-12">
        {/* Reservation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-6 border border-slate-100">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bienvenue,</p>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{reservation.clientName}</h2>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-[#c5a059]/10 text-[#b08b45] text-[10px] font-black uppercase rounded border border-[#c5a059]/20">
                Chambre {reservation.roomNumber}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="text-slate-400 font-medium">Arrivée</p>
              <p className="font-bold text-slate-900">{new Date(reservation.checkIn).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="w-8 h-px bg-slate-200" />
            <div className="text-right">
              <p className="text-slate-400 font-medium">Départ</p>
              <p className="font-bold text-slate-900">{new Date(reservation.checkOut).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100 animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Enregistrement Terminé</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Vos informations d'identité ont été transmises avec succès à la réception.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium">
              À votre arrivée, veuillez simplement récupérer votre clé au comptoir VIP.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 animate-fadeIn">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0d5ca3] text-white flex items-center justify-center text-[10px]">1</span>
                Pièce d'Identité
              </h3>
              <p className="text-xs text-slate-500 mt-2">Conformément à la réglementation locale, une pièce d'identité valide est requise pour finaliser votre séjour.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Type de Pièce</label>
                <select 
                  value={kycForm.idType}
                  onChange={(e) => setKycForm({...kycForm, idType: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
                >
                  <option value="CNI">Carte Nationale d'Identité</option>
                  <option value="PASSPORT">Passeport</option>
                  <option value="RESIDENT_CARD">Carte de Résident</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Numéro du Document</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: CI000123456"
                  value={kycForm.idNumber}
                  onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Date d'Expiration</label>
                <input 
                  type="date" 
                  required
                  value={kycForm.idExpiry}
                  onChange={(e) => setKycForm({...kycForm, idExpiry: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 shadow-lg shadow-[#c5a059]/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Transmettre ma pièce"
                  )}
                </button>
                <p className="text-[9px] text-center text-slate-400 mt-4 leading-tight">
                  Vos données sont chiffrées et conservées uniquement pour la durée de votre séjour conformément aux exigences légales.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
