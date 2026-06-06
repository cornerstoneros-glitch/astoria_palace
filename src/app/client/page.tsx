"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [requestType, setRequestType] = useState("ROOM_SERVICE");
  const [requestDesc, setRequestDesc] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    // Check auth cookie to simulate login security
    if (typeof document !== "undefined" && !document.cookie.includes("session_token")) {
      router.push("/login");
      return;
    }

    fetch("/api/client/profile")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setProfile(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const submitConcierge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    // Get the most recent active room number (or mock one if none found)
    const activeRes = profile.reservations.find((r: any) => r.status === "CONFIRMED" || r.status === "PENDING");
    const roomNum = activeRes ? activeRes.room.number : "101"; // Fallback to 101 for demo

    setRequesting(true);
    try {
      const res = await fetch("/api/client/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          description: requestDesc,
          roomNumber: roomNum
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setRequestSuccess(true);
        setTimeout(() => setRequestSuccess(false), 5000);
        setRequestDesc("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-6 bg-white border border-rose-200 rounded-xl text-center shadow-sm">
          <p className="text-rose-600 font-bold mb-4">Profil client introuvable.</p>
          <button onClick={handleLogout} className="text-xs uppercase tracking-wider font-bold text-slate-500 underline">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  // Calculate Loyalty progress
  const points = profile.loyalty?.points || 0;
  const tier = profile.loyalty?.tier || "STANDARD";
  let nextTier = "SILVER";
  let pointsNeeded = 500;
  let progressPct = Math.min(100, Math.round((points / 500) * 100));

  if (tier === "SILVER") { nextTier = "GOLD"; pointsNeeded = 1500; progressPct = Math.min(100, Math.round((points / 1500) * 100)); }
  if (tier === "GOLD") { nextTier = "PLATINUM"; pointsNeeded = 5000; progressPct = Math.min(100, Math.round((points / 5000) * 100)); }
  if (tier === "PLATINUM") { nextTier = "MAX"; pointsNeeded = 5000; progressPct = 100; }

  let tierColor = "from-slate-400 to-slate-500";
  if (tier === "SILVER") tierColor = "from-slate-300 to-slate-400 text-slate-900";
  if (tier === "GOLD") tierColor = "from-amber-300 to-yellow-500 text-amber-950";
  if (tier === "PLATINUM") tierColor = "from-slate-800 to-slate-950 text-white";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-auto rounded border p-0.5" />
          <div>
            <h1 className="text-sm font-black font-serif uppercase tracking-widest text-slate-900">Espace Résident</h1>
            <p className="text-[10px] text-slate-500 font-bold">{profile.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider bg-rose-50 px-3 py-1.5 rounded">
          Déconnexion
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8 animate-fadeIn">
        
        {/* Welcome & Loyalty Widget */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`md:col-span-2 rounded-2xl p-6 md:p-8 bg-gradient-to-br ${tierColor} shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]`}>
            {/* Decoration */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Astoria Rewards</span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase shadow-sm backdrop-blur-sm">{tier}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-serif mt-2">
                Bonjour, {profile.name?.split(' ')[0]}
              </h2>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black">{points.toLocaleString("fr-FR")} <span className="text-sm font-normal opacity-80">PTS</span></span>
                {nextTier !== "MAX" && <span className="text-[10px] font-bold uppercase opacity-80">{pointsNeeded - points} pts restants pour {nextTier}</span>}
              </div>
              {nextTier !== "MAX" && (
                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-center gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Raccourcis</h3>
            <Link href="/" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-[#c5a059] transition-all group">
              <span className="text-sm font-bold text-slate-700 group-hover:text-[#c5a059]">Nouvelle Réservation</span>
              <span className="text-slate-400">→</span>
            </Link>
            <a href="#concierge" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-[#0d5ca3] transition-all group">
              <span className="text-sm font-bold text-slate-700 group-hover:text-[#0d5ca3]">Service en chambre</span>
              <span className="text-slate-400">🛎️</span>
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reservation History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">Vos Séjours</h3>
            
            {profile.reservations?.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-4xl block mb-2 opacity-30">🧳</span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aucun séjour enregistré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.reservations.map((res: any) => {
                  const isActive = res.status === "PENDING" || res.status === "CONFIRMED";
                  return (
                    <div key={res.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${isActive ? "bg-white border-[#c5a059]/40 shadow-md" : "bg-slate-50 border-slate-200"}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {isActive ? "À venir / En cours" : "Terminé"}
                          </span>
                          <span className="text-xs font-bold text-[#0d5ca3]">{res.room?.roomType?.name}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">Chambre {res.room?.number}</p>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1">
                          Du {new Date(res.checkIn).toLocaleDateString("fr-FR")} au {new Date(res.checkOut).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <span className="text-sm font-black text-[#c5a059] sm:text-right">{res.totalPrice.toLocaleString("fr-FR")} F</span>
                        {!isActive && (
                          <button className="text-[10px] font-bold uppercase text-slate-500 hover:text-slate-800 underline sm:text-right">Télécharger Facture</button>
                        )}
                        {isActive && (
                          <Link href={`/checkin/${res.id}`} className="px-3 py-1.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider text-center shadow-sm">
                            Faire mon Check-in
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Concierge Widget */}
          <div id="concierge" className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">Conciergerie Digitale</h3>
            
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🛎️</div>
              <p className="text-xs text-slate-500 font-semibold mb-6 relative z-10 leading-relaxed">
                Une demande spéciale pendant votre séjour ? Sélectionnez le service souhaité, notre équipe s'en occupe immédiatement.
              </p>

              {requestSuccess ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center animate-fadeIn">
                  <span className="text-2xl mb-2 block">✅</span>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Demande envoyée</span>
                  <p className="text-[10px] text-emerald-600 mt-1">La réception a bien reçu votre demande.</p>
                </div>
              ) : (
                <form onSubmit={submitConcierge} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Type de Service</label>
                    <select 
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0d5ca3] focus:outline-none"
                    >
                      <option value="ROOM_SERVICE">🍽️ Room Service (Repas)</option>
                      <option value="TOWELS">🧻 Serviettes Supplémentaires</option>
                      <option value="MAINTENANCE">🔧 Problème Technique</option>
                      <option value="CLEANING">🧹 Demander le Nettoyage</option>
                      <option value="OTHER">💬 Autre Demande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Précisions (Optionnel)</label>
                    <textarea 
                      value={requestDesc}
                      onChange={(e) => setRequestDesc(e.target.value)}
                      placeholder="Ex: J'aimerais que ma chambre soit faite à 14h..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0d5ca3] focus:outline-none resize-none h-20"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={requesting}
                    className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all flex justify-center items-center h-[40px]"
                  >
                    {requesting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Envoyer ma demande"}
                  </button>
                </form>
              )}
            </div>

            {/* Guest Preferences */}
            {profile.preferences && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 mt-6">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">Vos Préférences Enregistrées</h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-semibold">
                  {profile.preferences.pillowType && <div className="flex flex-col"><span className="text-[9px] text-slate-400 uppercase">Oreiller</span><span>{profile.preferences.pillowType}</span></div>}
                  {profile.preferences.beverages && <div className="flex flex-col"><span className="text-[9px] text-slate-400 uppercase">Boisson favorite</span><span>{profile.preferences.beverages}</span></div>}
                  {profile.preferences.dietaryNotes && <div className="flex flex-col"><span className="text-[9px] text-slate-400 uppercase">Allergies/Régime</span><span>{profile.preferences.dietaryNotes}</span></div>}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
