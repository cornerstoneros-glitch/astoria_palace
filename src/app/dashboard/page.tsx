"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [concierge, setConcierge] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Tab Navigation
  const [activeTab, setActiveTab] = useState<string>("rooms");

  // Load States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [newBooking, setNewBooking] = useState({
    clientId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // KYC Modal States
  const [kycResId, setKycResId] = useState<string | null>(null);
  const [kycForm, setKycForm] = useState({
    idType: "CNI",
    idNumber: "",
    idExpiry: "",
  });

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from our local Next.js API endpoints
      const [
        roomsRes,
        resRes,
        conciergeRes,
        invRes,
        settingsRes,
        testRes,
      ] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/reservations"),
        fetch("/api/concierge"),
        fetch("/api/inventory"),
        fetch("/api/settings"),
        fetch("/api/test"), // Queries seeded users & roomTypes
      ]);

      const roomsJson = await roomsRes.json();
      const resJson = await resRes.json();
      const conciergeJson = await conciergeRes.json();
      const invJson = await invRes.json();
      const settingsJson = await settingsRes.json();
      const testJson = await testRes.json();

      if (roomsJson.status === "success") setRooms(roomsJson.data);
      if (resJson.status === "success") setReservations(resJson.data);
      if (conciergeJson.status === "success") setConcierge(conciergeJson.data);
      if (invJson.status === "success") setInventory(invJson.data);
      if (settingsJson.status === "success") setSettings(settingsJson.data);

      if (testJson.status === "success") {
        setRoomTypes(testJson.data.roomTypes || []);
        setSites(testJson.data.sites || []);
        // Setup mock users for booking dropdown
        setUsers([
          { id: "client-id-1", name: "DIBONA ROGER TRAORE", email: "roger.traore@gmail.com" },
          { id: "client-id-2", name: "KOUAME PATRICE YAO", email: "patrice.yao@yahoo.fr" },
          { id: "client-id-3", name: "AMANI KOFFI SERGE", email: "serge.amani@ci-news.com" },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync database. Ensure Next.js dev server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update room status
  const handleRoomStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setRooms(rooms.map((r) => (r.id === roomId ? data.data : r)));
      }
    } catch (err) {
      console.error("Failed to update room status", err);
    }
  };

  // Update reservation status
  const handleReservationStatusChange = async (resId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${resId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setReservations(reservations.map((res) => (res.id === resId ? data.data : res)));
        fetchData(); // reload rooms to reflect occupied changes
      }
    } catch (err) {
      console.error("Failed to update reservation", err);
    }
  };

  // Submit KYC ID data
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycResId) return;

    try {
      const response = await fetch(`/api/reservations/${kycResId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycForm),
      });
      const data = await response.json();
      if (data.status === "success") {
        setReservations(reservations.map((res) => (res.id === kycResId ? { ...res, checkInStatus: "KYC_SUBMITTED", kycData: data.data } : res)));
        setKycResId(null);
        setKycForm({ idType: "CNI", idNumber: "", idExpiry: "" });
      }
    } catch (err) {
      console.error("Failed to submit KYC data", err);
    }
  };

  // Complete Concierge request
  const handleConciergeComplete = async (requestId: string) => {
    try {
      const response = await fetch(`/api/concierge/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setConcierge(concierge.map((c) => (c.id === requestId ? data.data : c)));
      }
    } catch (err) {
      console.error("Failed to resolve concierge request", err);
    }
  };

  // Create quick booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });
      const data = await response.json();
      if (data.status === "success") {
        setBookingSuccess("Réservation créée avec succès !");
        setNewBooking({ clientId: "", roomId: "", checkIn: "", checkOut: "" });
        fetchData(); // reload rooms and reservations
      } else {
        setBookingError(data.message || "Failed to book room.");
      }
    } catch (err) {
      setBookingError("Server error occurred while booking.");
    }
  };

  // Analytical stats
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const cleaningCount = rooms.filter((r) => r.status === "CLEANING").length;
  const maintenanceCount = rooms.filter((r) => r.status === "MAINTENANCE").length;
  const lowStockCount = inventory.filter((item) => item.quantity <= item.minThreshold).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold tracking-widest text-[#b08b45] uppercase border border-[#c5a059]/30 px-2.5 py-1 rounded hover:bg-[#c5a059]/10 transition-colors bg-white shadow-sm">
            ← Site Client
          </Link>
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Logo Astoria Palace" 
              className="h-10 w-auto object-contain rounded bg-white p-0.5 border border-slate-200 shadow-sm" 
            />
            <div className="flex flex-col">
              <h1 className="text-base font-extrabold font-serif text-slate-900 tracking-wide leading-tight">
                SGHI — ASTORIA PALACE
              </h1>
              <div className="flex items-center gap-0.5 text-[9px] text-[#c5a059] font-bold">
                <span>★</span><span>★</span><span>★</span><span>★</span>
                <span className="text-slate-500 font-sans normal-case tracking-normal ml-2 text-[9px]">Console de Gestion</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-slate-600 font-semibold">Bdd Connectée (SQLite)</span>
        </div>
      </header>

      {/* DASHBOARD CORE CONTENT */}
      {error && (
        <div className="m-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#0d5ca3] border-t-transparent animate-spin" />
          <span className="text-sm text-slate-400">Synchronisation en cours...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-6 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Principal</p>
              <nav className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setActiveTab("rooms")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                    activeTab === "rooms" 
                      ? "bg-[#0d5ca3] text-white shadow-md shadow-blue-500/10" 
                      : "text-slate-650 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">🏨</span>
                  Chambres ({totalRooms})
                </button>

                <button 
                  onClick={() => setActiveTab("reservations")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                    activeTab === "reservations" 
                      ? "bg-[#0d5ca3] text-white shadow-md shadow-blue-500/10" 
                      : "text-slate-650 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">📅</span>
                  Réservations ({reservations.length})
                </button>

                <button 
                  onClick={() => setActiveTab("concierge")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                    activeTab === "concierge" 
                      ? "bg-[#0d5ca3] text-white shadow-md shadow-blue-500/10" 
                      : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">🛎️</span>
                  Requêtes ({concierge.filter(c => c.status === "PENDING").length})
                </button>

                <button 
                  onClick={() => setActiveTab("inventory")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                    activeTab === "inventory" 
                      ? "bg-[#0d5ca3] text-white shadow-md shadow-blue-500/10" 
                      : "text-slate-655 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">📦</span>
                  Stocks & Épicerie 
                  {lowStockCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm">
                <span className="block font-bold text-slate-500 mb-1">Établissement</span>
                <span className="block text-[#0d5ca3] font-bold">{sites[0]?.name || "Astoria Palace"}</span>
                <span className="block text-slate-500 mt-1">{sites[0]?.location || "Yopougon, Abidjan"}</span>
              </div>
            </div>
          </aside>

          {/* MAIN DESK PANEL */}
          <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Taux d'Occupation</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold font-serif text-slate-900">
                    {totalRooms ? Math.round((occupiedCount / totalRooms) * 100) : 0}%
                  </span>
                  <span className="text-[10px] text-slate-500">({occupiedCount}/{totalRooms} ch.)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ménage requis</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold font-serif text-[#b08b45]">{cleaningCount}</span>
                  <span className="text-[10px] text-slate-550">chambres sales</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hors service (SAV)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold font-serif text-rose-600">{maintenanceCount}</span>
                  <span className="text-[10px] text-slate-550">en réparation</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-[#0d5ca3]/30 transition-all flex flex-col justify-between shadow-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Alertes de Stock</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-2xl font-bold font-serif ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {lowStockCount}
                  </span>
                  <span className="text-[10px] text-slate-550">articles critiques</span>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: ROOMS */}
            {activeTab === "rooms" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Heatmap & Statuts des Chambres</h2>
                    <p className="text-xs text-slate-550">Modifiez le statut des chambres en temps réel pour coordonner la réception et les gouvernantes.</p>
                  </div>
                  
                  {/* Legend colors */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-600 bg-white px-4 py-2 border border-slate-200/80 shadow-sm rounded-lg">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Libre</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c5a059]" /> Occupée</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Nettoyage</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Réparation</span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {rooms.map((room) => {
                    const isOccupied = room.status === "OCCUPIED";
                    const isCleaning = room.status === "CLEANING";
                    const isMaintenance = room.status === "MAINTENANCE";
                    
                    let bgBorderClass = "border-slate-200 bg-white hover:border-emerald-500/40 shadow-sm";
                    let statusDot = "bg-emerald-500";
                    if (isOccupied) {
                      bgBorderClass = "border-[#c5a059]/35 hover:border-[#c5a059]/60 bg-[#c5a059]/5 shadow-sm";
                      statusDot = "bg-[#c5a059]";
                    } else if (isCleaning) {
                      bgBorderClass = "border-indigo-200 hover:border-indigo-400 bg-indigo-50/70 shadow-sm";
                      statusDot = "bg-indigo-500";
                    } else if (isMaintenance) {
                      bgBorderClass = "border-rose-200 hover:border-rose-400 bg-rose-50/70 shadow-sm";
                      statusDot = "bg-rose-500";
                    }

                    return (
                      <div 
                        key={room.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between min-h-32 transition-all ${bgBorderClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold font-serif tracking-wide text-slate-900">{room.number}</span>
                          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                            {room.roomType?.name.split(' ').pop()}
                          </span>
                          
                          {/* Selector */}
                          <select 
                            value={room.status}
                            onChange={(e) => handleRoomStatusChange(room.id, e.target.value)}
                            className="w-full text-[10px] py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold focus:outline-none focus:border-[#c5a059] focus:bg-white"
                          >
                            <option value="AVAILABLE">Libre</option>
                            <option value="OCCUPIED">Occupée</option>
                            <option value="CLEANING">Nettoyage</option>
                            <option value="MAINTENANCE">SAV / Réparer</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESERVATIONS */}
            {activeTab === "reservations" && (
              <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                
                {/* Bookings List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Registre des Réservations</h2>
                    <p className="text-xs text-slate-500">Gérez le KYC réglementaire et mettez à jour le statut des check-ins.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {reservations.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-sm shadow-sm">
                        Aucune réservation enregistrée dans le système.
                      </div>
                    ) : (
                      reservations.map((res) => {
                        const checkInDate = new Date(res.checkIn).toLocaleDateString("fr-FR");
                        const checkOutDate = new Date(res.checkOut).toLocaleDateString("fr-FR");
                        const isKycSubmitted = res.checkInStatus === "KYC_SUBMITTED" || res.kycData;

                        return (
                          <div 
                            key={res.id} 
                            className="p-5 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:border-[#0d5ca3]/20 transition-all"
                          >
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                                  Chambre {res.room?.number}
                                </span>
                                <span className="text-xs text-[#0d5ca3] font-bold">{res.room?.roomType?.name}</span>
                              </div>
                              
                              <h3 className="text-base font-bold text-slate-900 uppercase font-serif">
                                {res.client?.name}
                              </h3>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-655 font-medium">
                                <span>📅 {checkInDate} au {checkOutDate}</span>
                                <span>💰 {res.totalPrice.toLocaleString("fr-FR")} FCFA</span>
                              </div>

                              {/* KYC Label status */}
                              <div className="mt-1 flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isKycSubmitted 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                }`}>
                                  {isKycSubmitted ? "KYC Complété" : "KYC Requis (ARTCI)"}
                                </span>
                                {res.kycData && (
                                  <span className="text-[10px] text-slate-500">
                                    ({res.kycData.idType} : {res.kycData.idNumber})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions block */}
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-550 tracking-wider">
                                Statut Séjour : <span className="text-[#b08b45] font-black">{res.status}</span>
                              </span>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* KYC Submit trigger */}
                                {!isKycSubmitted && (
                                  <button 
                                    onClick={() => setKycResId(res.id)}
                                    className="px-3 py-1.5 rounded text-xs font-bold bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#b08b45] border border-[#c5a059]/40 transition-colors animate-pulse"
                                  >
                                    Enregistrer ID (CNI)
                                  </button>
                                )}

                                {/* Check-in trigger */}
                                {res.status === "PENDING" && (
                                  <button 
                                    onClick={() => handleReservationStatusChange(res.id, "CONFIRMED")}
                                    className="px-3 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0d5ca3] text-white transition-colors"
                                  >
                                    Confirmer Arrivée
                                  </button>
                                )}

                                {/* Check-out trigger */}
                                {res.status === "CONFIRMED" && (
                                  <button 
                                    onClick={() => handleReservationStatusChange(res.id, "COMPLETED")}
                                    className="px-3 py-1.5 rounded text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 transition-colors"
                                  >
                                    Check-out / Facturer
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Create Quick Booking Widget */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Nouvelle Réservation</h2>
                    <p className="text-xs text-slate-550">Enregistrez un séjour avec calcul tarifaire automatique et vérification de collision des dates.</p>
                  </div>

                  <form onSubmit={handleCreateBooking} className="p-5 rounded-xl bg-white border border-slate-200/80 flex flex-col gap-4 text-xs font-medium shadow-sm">
                    {bookingError && (
                      <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700">
                        {bookingError}
                      </div>
                    )}
                    {bookingSuccess && (
                      <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                        {bookingSuccess}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-655 font-bold">Client</label>
                      <select 
                        required
                        value={newBooking.clientId}
                        onChange={(e) => setNewBooking({ ...newBooking, clientId: e.target.value })}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059] focus:bg-white"
                      >
                        <option value="">Sélectionner un client...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-655 font-bold">Chambre</label>
                      <select 
                        required
                        value={newBooking.roomId}
                        onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059] focus:bg-white"
                      >
                        <option value="">Sélectionner une chambre libre...</option>
                        {rooms.filter(r => r.status === "AVAILABLE").map((r) => (
                          <option key={r.id} value={r.id}>
                            N° {r.number} — {r.roomType?.name} ({r.roomType?.price.toLocaleString("fr-FR")} F/nuit)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-655 font-bold">Check-in</label>
                        <input 
                          type="date"
                          required
                          value={newBooking.checkIn}
                          onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059] focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-655 font-bold">Check-out</label>
                        <input 
                          type="date"
                          required
                          value={newBooking.checkOut}
                          onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#c5a059] focus:bg-white"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="mt-2 py-3 rounded bg-[#c5a059] hover:bg-[#b08b45] text-slate-950 font-bold tracking-wider uppercase transition-colors"
                    >
                      Enregistrer le Séjour
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB CONTENT: CONCIERGE & SERVICES */}
            {activeTab === "concierge" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Requêtes & Services Chambres</h2>
                  <p className="text-xs text-slate-500">Pilotez les demandes des résidents (room service, serviettes, maintenance technique) et validez leur exécution.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {concierge.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 p-8 text-center rounded-xl bg-white border border-slate-200 text-slate-500 text-sm shadow-sm">
                      Aucune requête de service active en cours.
                    </div>
                  ) : (
                    concierge.map((req) => {
                      const isPending = req.status === "PENDING";
                      const dateAdded = new Date(req.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div 
                          key={req.id} 
                          className="p-5 rounded-xl bg-white border border-slate-200/80 flex flex-col justify-between gap-4 shadow-sm hover:border-[#0d5ca3]/20 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                                Ch. {req.roomNumber}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">À {dateAdded}</span>
                            </div>

                            <span className="block text-sm font-bold text-[#0d5ca3] mb-1.5 uppercase font-serif tracking-wide">
                              🛎️ {req.type.replace('_', ' ')}
                            </span>
                            
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {req.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isPending ? 'text-[#b08b45] animate-pulse font-black' : 'text-emerald-600 font-bold'
                            }`}>
                              {isPending ? "En Attente" : "Exécuté"}
                            </span>

                            {isPending && (
                              <button 
                                onClick={() => handleConciergeComplete(req.id)}
                                className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#0d5ca3] hover:bg-[#0d5ca3]/90 text-white transition-colors shadow-sm"
                              >
                                Résoudre
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVENTORY */}
            {activeTab === "inventory" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Gestion des Stocks & Inventaires</h2>
                  <p className="text-xs text-slate-550">Suivi des stocks F&B, blanchisserie et linge. Les lignes rouges indiquent un réapprovisionnement nécessaire.</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Nom de l'article</th>
                        <th className="px-6 py-4">Catégorie</th>
                        <th className="px-6 py-4 text-center">Quantité</th>
                        <th className="px-6 py-4 text-center">Alerte Mini</th>
                        <th className="px-6 py-4 text-right">Statut Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {inventory.map((item) => {
                        const isLow = item.quantity <= item.minThreshold;

                        return (
                          <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-rose-500/[0.01]' : ''}`}>
                            <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-6 py-4 text-slate-655">{item.category}</td>
                            <td className="px-6 py-4 text-center font-bold font-serif text-slate-800">{item.quantity} {item.unit}</td>
                            <td className="px-6 py-4 text-center text-slate-500">{item.minThreshold} {item.unit}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isLow ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {isLow ? "Alerte réappro" : "Stock suffisant"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* KYC DRAW MODAL SIMULATION */}
      {kycResId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900 font-serif mb-2">Enregistrement CNI / Passeport</h3>
            <p className="text-xs text-slate-500 mb-4">Conformément à la réglementation ivoirienne (ARTCI), enregistrez la pièce d'identité du client pour activer la clé de chambre.</p>

            <form onSubmit={handleKycSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Type de Pièce</label>
                <select 
                  value={kycForm.idType}
                  onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                >
                  <option value="CNI">CNI (Côte d'Ivoire)</option>
                  <option value="Passport">Passeport</option>
                  <option value="Attestation">Attestation d'Identité</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Numéro de la pièce</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: C010823901"
                  value={kycForm.idNumber}
                  onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-655 font-bold">Date d'Expiration</label>
                <input 
                  type="date"
                  value={kycForm.idExpiry}
                  onChange={(e) => setKycForm({ ...kycForm, idExpiry: e.target.value })}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#0d5ca3] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setKycResId(null)}
                  className="flex-1 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 uppercase transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase transition-colors hover:shadow-md hover:brightness-105 active:scale-[0.98]"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
