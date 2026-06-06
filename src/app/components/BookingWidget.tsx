"use client";

import { useState, useEffect } from "react";

interface RoomAvailability {
  id: string;
  name: string;
  price: number;
  capacity: number;
  image: string | null;
  totalRooms: number;
  availableCount: number;
  isAvailable: boolean;
}

export default function BookingWidget() {
  // Date states - default to today and tomorrow
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays > 0) d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  const [checkIn, setCheckIn] = useState(getTodayString(0));
  const [checkOut, setCheckOut] = useState(getTodayString(1));
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [overall, setOverall] = useState<any>({ total: 77, available: 77 });
  const [error, setError] = useState<string | null>(null);

  // Active reservation modal states
  const [selectedRoomType, setSelectedRoomType] = useState<RoomAvailability | null>(null);
  const [step, setStep] = useState(1);
  const [upsellOptions, setUpsellOptions] = useState<{id: string, name: string, price: number}[]>([]);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch real-time availability stats
  const fetchAvailability = async (ci: string, co: string, isManualSearch = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/rooms/availability?checkIn=${ci}&checkOut=${co}`);
      const json = await res.json();
      if (json.status === "success") {
        setAvailability(json.data.availability);
        setOverall(json.data.overall);
        if (isManualSearch) {
          setTimeout(() => {
            const grid = document.getElementById("availability-grid");
            if (grid) grid.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
      } else {
        setError(json.message || "Impossible de charger la disponibilité.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur d'hébergement.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAvailability(checkIn, checkOut, false);
  }, []);

  // Handle Search trigger
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("La date de départ doit être après la date d'arrivée.");
      return;
    }
    fetchAvailability(checkIn, checkOut, true);
  };

  // Calculate duration in nights
  const getNightsCount = () => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const diff = Math.abs(co.getTime() - ci.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  // Submit client booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomType) return;
    setBookingLoading(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/reservations/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn,
          checkOut,
          roomTypeId: selectedRoomType.id,
          clientName: clientForm.name,
          clientEmail: clientForm.email,
          clientPhone: clientForm.phone,
          options: upsellOptions, // API ignores or appends this to notes
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setBookingSuccess(data.data);
        // Refresh availability grid
        fetchAvailability(checkIn, checkOut);
      } else {
        setBookingError(data.message || "Erreur lors de la confirmation.");
      }
    } catch (err) {
      setBookingError("Erreur serveur de réservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedRoomType(null);
    setStep(1);
    setUpsellOptions([]);
    setClientForm({ name: "", email: "", phone: "" });
    setBookingSuccess(null);
    setBookingError(null);
  };

  return (
    <div className="w-full space-y-12">
      {/* SEARCH AND GENERAL STATUS WIDGET */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-md max-w-5xl mx-auto -mt-10 relative z-20">
        
        {/* Real-time hotel lodging occupancy status badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-700 uppercase tracking-wider">Statut des Disponibilités en Direct</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>En ce moment :</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {overall.available} / {overall.total} chambres libres
            </span>
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Arrivée
            </label>
            <input 
              type="date" 
              required
              min={getTodayString(0)}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Départ
            </label>
            <input 
              type="date" 
              required
              min={getTodayString(1)}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Voyageurs
            </label>
            <select 
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
            >
              <option value={1}>1 Adulte</option>
              <option value={2}>2 Adultes</option>
              <option value={3}>3 Adultes / Famille</option>
              <option value={4}>4 Adultes / Famille</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white hover:from-[#1e40af] hover:to-[#0d5ca3] shadow-md transition-all flex items-center justify-center gap-1.5 h-[42px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>🔍</span> Rechercher
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="text-xs text-red-600 mt-3 font-semibold">{error}</p>
        )}
      </div>

      {/* AVAILABILITY RESULTS GRID */}
      <div id="availability-grid" className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 transition-all duration-300 ${loading ? "opacity-40 pointer-events-none scale-[0.98]" : "opacity-100 scale-100"}`}>
        {availability.map((type) => {
          const count = type.availableCount;
          const isFilterActive = checkIn !== "" && checkOut !== "";
          const colorClass = count > 5 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : count > 0 ? "bg-amber-50 text-amber-700 border-amber-250" : "bg-red-50 text-red-700 border-red-200";
          const textLabel = count > 0 ? `${count} dispo(s) pour ces dates` : "Complet pour cette période";

          return (
            <div 
              key={type.id} 
              className="group flex flex-col rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 hover:border-[#0d5ca3]/40 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
            >
              {/* Card Image section */}
              <div className="relative h-48 overflow-hidden border-b border-slate-200 bg-slate-100">
                {type.image ? (
                  <img 
                    src={`/${type.image}`}
                    alt={type.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0d5ca3]/10 to-slate-100 flex items-center justify-center">
                    <span className="text-4xl font-serif text-slate-300 select-none uppercase tracking-widest">★ ★ ★ ★</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[#0d5ca3]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Floating availability indicator */}
                <div className={`absolute top-4 left-4 px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
                  {textLabel}
                </div>

                {/* Floating Price tag */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-white border border-[#c5a059]/40 text-xs font-bold text-[#b08b45] tracking-wide shadow-sm z-10">
                  {type.price.toLocaleString("fr-FR")} FCFA <span className="text-[10px] text-slate-500 font-normal">/ nuit</span>
                </div>
              </div>

              {/* Card Details section */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 group-hover:text-[#0d5ca3] transition-colors mb-2">
                    {type.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Profitez de chambres de grand standing climatisées avec literie d'exception, TV satellite, et service en chambre 24h/24.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-slate-500">
                    Capacité : {type.capacity} pers.
                  </span>
                  
                  {type.availableCount > 0 ? (
                    <button 
                      onClick={() => setSelectedRoomType(type)}
                      className="px-4 py-2 rounded-lg font-bold bg-[#c5a059] text-slate-950 hover:bg-[#b08b45] transition-all text-xs"
                    >
                      Réserver
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="px-4 py-2 rounded-lg font-bold bg-slate-250 text-slate-400 text-xs cursor-not-allowed"
                    >
                      Complet
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LUXURY RESERVATION MODAL */}
      {selectedRoomType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            
            {/* Header info */}
            <div className="bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold">Demande de Réservation</h3>
                <p className="text-[10px] text-slate-200 mt-1 uppercase tracking-wider">{selectedRoomType.name}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:text-slate-200 text-lg font-bold">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Progress Tracker */}
              {!bookingSuccess && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[#c5a059]' : 'bg-slate-200'}`} />
                  <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-[#c5a059]' : 'bg-slate-200'}`} />
                  <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#c5a059]' : 'bg-slate-200'}`} />
                </div>
              )}

              {!bookingSuccess ? (
                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleBookingSubmit} className="space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-650 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dates</span>
                      <strong className="text-slate-800">{new Date(checkIn).toLocaleDateString("fr-FR")} - {new Date(checkOut).toLocaleDateString("fr-FR")}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarif Total Estimé</span>
                      <strong className="text-[#0d5ca3] font-black text-sm">
                        {((getNightsCount() * selectedRoomType.price) + upsellOptions.reduce((acc, o) => acc + o.price, 0)).toLocaleString("fr-FR")} F 
                      </strong>
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 pb-2">1. Vos Coordonnées</h4>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Nom & Prénom</label>
                        <input type="text" required value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Adresse E-mail</label>
                        <input type="email" required value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Numéro de Téléphone</label>
                        <input type="tel" required value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none" />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase text-[#c5a059] border-b border-slate-200 pb-2">2. Améliorez votre séjour (Optionnel)</h4>
                      
                      {/* Option 1 */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${upsellOptions.find(o => o.id === "transfer") ? "bg-[#c5a059]/10 border-[#c5a059]" : "bg-white border-slate-200 hover:border-[#c5a059]/50"}`}>
                        <input type="checkbox" className="mt-1 accent-[#c5a059]" 
                          checked={!!upsellOptions.find(o => o.id === "transfer")}
                          onChange={(e) => {
                            if (e.target.checked) setUpsellOptions([...upsellOptions, { id: "transfer", name: "Transfert Aéroport", price: 25000 }]);
                            else setUpsellOptions(upsellOptions.filter(o => o.id !== "transfer"));
                          }} 
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-900">Transfert Aéroport VIP</span>
                            <span className="font-bold text-[#b08b45] text-xs">+25 000 F</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Navette privée depuis l'aéroport FHB directement jusqu'à l'hôtel.</p>
                        </div>
                      </label>

                      {/* Option 2 */}
                      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${upsellOptions.find(o => o.id === "spa") ? "bg-[#c5a059]/10 border-[#c5a059]" : "bg-white border-slate-200 hover:border-[#c5a059]/50"}`}>
                        <input type="checkbox" className="mt-1 accent-[#c5a059]" 
                          checked={!!upsellOptions.find(o => o.id === "spa")}
                          onChange={(e) => {
                            if (e.target.checked) setUpsellOptions([...upsellOptions, { id: "spa", name: "Pass Spa Intense", price: 40000 }]);
                            else setUpsellOptions(upsellOptions.filter(o => o.id !== "spa"));
                          }} 
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-900">Pass Spa Intense (2 Pers)</span>
                            <span className="font-bold text-[#b08b45] text-xs">+40 000 F</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Accès illimité au jacuzzi et massage relaxant de 45 minutes.</p>
                        </div>
                      </label>

                    </div>
                  )}

                  {bookingError && <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded border border-red-200">{bookingError}</p>}

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    {step === 2 && (
                      <button type="button" onClick={() => setStep(1)} className="w-1/3 py-2.5 rounded-lg text-xs font-bold uppercase text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all text-center">
                        Retour
                      </button>
                    )}
                    <button type="submit" disabled={bookingLoading} className={`${step === 1 ? 'w-full' : 'w-2/3'} py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 font-sans shadow-md flex items-center justify-center gap-1.5`}>
                      {bookingLoading ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : (step === 1 ? "Continuer" : "Confirmer la Réservation")}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Card Display */
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif">Réservation Confirmée !</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Votre séjour a été enregistré avec succès. Voici les détails :</p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between"><span className="text-slate-400 font-medium">Chambre :</span><span className="font-bold text-slate-800">N° {bookingSuccess.roomNumber} ({bookingSuccess.roomTypeName})</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-medium">Arrivée - Départ :</span><span className="font-bold text-slate-800">{new Date(bookingSuccess.checkIn).toLocaleDateString("fr-FR")} au {new Date(bookingSuccess.checkOut).toLocaleDateString("fr-FR")}</span></div>
                    {upsellOptions.length > 0 && (
                      <div className="flex flex-col pt-1">
                        <span className="text-slate-400 font-medium border-t border-slate-200 pt-1 mt-1">Options ajoutées :</span>
                        {upsellOptions.map(o => <div key={o.id} className="text-[#c5a059] font-bold text-[10px] text-right">+ {o.name}</div>)}
                      </div>
                    )}
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-200"><span className="text-slate-400 font-medium">Total facturé :</span><span className="font-bold text-[#0d5ca3]">{(bookingSuccess.totalPrice + upsellOptions.reduce((acc, o) => acc + o.price, 0)).toLocaleString("fr-FR")} FCFA</span></div>
                  </div>
                  <button onClick={closeModal} className="w-full py-2.5 rounded-lg text-xs font-bold uppercase bg-slate-900 text-white hover:bg-slate-800 transition-all max-w-xs mx-auto block">Fermer</button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
