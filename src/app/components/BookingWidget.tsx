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
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch real-time availability stats
  const fetchAvailability = async (ci: string, co: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/rooms/availability?checkIn=${ci}&checkOut=${co}`);
      const json = await res.json();
      if (json.status === "success") {
        setAvailability(json.data.availability);
        setOverall(json.data.overall);
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
    fetchAvailability(checkIn, checkOut);
  }, []);

  // Handle Search trigger
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("La date de départ doit être après la date d'arrivée.");
      return;
    }
    fetchAvailability(checkIn, checkOut);
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
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
              <button 
                onClick={closeModal}
                className="text-white hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!bookingSuccess ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-650 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dates de séjour</span>
                      <strong className="text-slate-800">{new Date(checkIn).toLocaleDateString("fr-FR")} au {new Date(checkOut).toLocaleDateString("fr-FR")}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarif Estimé</span>
                      <strong className="text-[#0d5ca3] font-black text-sm">
                        {(getNightsCount() * selectedRoomType.price).toLocaleString("fr-FR")} FCFA 
                        <span className="text-[10px] text-slate-500 font-normal"> ({getNightsCount()} nuits)</span>
                      </strong>
                    </div>
                  </div>

                  {/* Customer Information Inputs */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Nom & Prénom
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="ex: KOUAME PATRICE YAO"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Adresse E-mail
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="ex: patrice.yao@gmail.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Numéro de Téléphone
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="ex: +225 07 08 09 10 11"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>

                  {bookingError && (
                    <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded border border-red-200">{bookingError}</p>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={closeModal}
                      className="w-1/3 py-2.5 rounded-lg text-xs font-bold uppercase text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all text-center"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={bookingLoading}
                      className="w-2/3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c5a059] to-[#b08b45] hover:from-[#b08b45] hover:to-[#c5a059] text-slate-950 font-sans shadow-md flex items-center justify-center gap-1.5"
                    >
                      {bookingLoading ? (
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Confirmer la Réservation"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Card Display */
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif">Réservation Confirmée !</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Votre séjour a été enregistré avec succès dans notre registre d'hébergement. Voici les détails :
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Chambre assignée :</span>
                      <span className="font-bold text-slate-800">N° {bookingSuccess.roomNumber} ({bookingSuccess.roomTypeName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Arrivée - Départ :</span>
                      <span className="font-bold text-slate-800">
                        {new Date(bookingSuccess.checkIn).toLocaleDateString("fr-FR")} au {new Date(bookingSuccess.checkOut).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Total facturé :</span>
                      <span className="font-bold text-[#0d5ca3]">{bookingSuccess.totalPrice.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Statut :</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-[#b08b45] font-bold border border-amber-200 uppercase text-[9px]">En attente de paiement</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Veuillez préparer votre pièce d'identité (CNI ou Passeport) à votre arrivée pour le KYC réglementaire.
                  </p>

                  <button 
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-lg text-xs font-bold uppercase bg-slate-900 text-white hover:bg-slate-800 transition-all max-w-xs mx-auto block"
                  >
                    Fermer la fenêtre
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
