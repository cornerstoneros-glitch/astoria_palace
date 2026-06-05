"use client";

import { useMemo } from "react";

interface AnalyticsPanelProps {
  rooms: any[];
  transactions: any[];
}

export default function AnalyticsPanel({ rooms, transactions }: AnalyticsPanelProps) {
  // Financial stream calculations
  const stats = useMemo(() => {
    const fnbRev = transactions.filter(t => t.category === "FNB" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const roomRev = transactions.filter(t => t.category === "RESERVATION" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const eventRev = transactions.filter(t => t.category === "EVENTS" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalRev = fnbRev + roomRev + eventRev;

    const salaryExp = transactions.filter(t => t.category === "SALARY" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const restockExp = transactions.filter(t => t.category === "RESTOCK" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const utilitiesExp = transactions.filter(t => t.category === "UTILITIES" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const generalExp = transactions.filter(t => t.category === "GENERAL" && t.status === "PAID").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExp = salaryExp + restockExp + utilitiesExp + generalExp;

    const netMargin = totalRev > 0 ? Math.round(((totalRev - totalExp) / totalRev) * 100) : 0;

    // Room Type Occupancy
    const roomTypes = [
      { key: "Standard", name: "Chambres Standards" },
      { key: "Supérieure", name: "Chambres Supérieures" },
      { key: "Junior Suite", name: "Suites Juniors" },
      { key: "Suite Exécutive", name: "Suites Exécutives" },
      { key: "Suite Présidentielle", name: "Suites Présidentielles" },
    ];

    const typeOccupancies = roomTypes.map(t => {
      const typeRooms = rooms.filter(r => r.roomType?.name.includes(t.key));
      const total = typeRooms.length;
      const occupied = typeRooms.filter(r => r.status === "OCCUPIED").length;
      const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return { ...t, total, occupied, pct };
    });

    // Donut chart stroke dashes (Total 100)
    const roomPct = totalRev > 0 ? Math.round((roomRev / totalRev) * 100) : 60;
    const fnbPct = totalRev > 0 ? Math.round((fnbRev / totalRev) * 100) : 25;
    const eventPct = totalRev > 0 ? Math.round((eventRev / totalRev) * 100) : 15;

    return {
      fnbRev,
      roomRev,
      eventRev,
      totalRev,
      totalExp,
      netMargin,
      typeOccupancies,
      dashes: {
        room: roomPct,
        fnb: fnbPct,
        event: eventPct,
      }
    };
  }, [rooms, transactions]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Rapports d'Activité & Analytiques</h2>
        <p className="text-xs text-slate-550 mt-1">Données analytiques basées sur l'historique financier et l'état en temps réel des chambres.</p>
      </div>

      {/* Analytics KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chiffre d'Affaires Cumulé</span>
          <h3 className="text-3xl font-extrabold font-serif text-[#0d5ca3] mt-2">
            {stats.totalRev.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[11px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Chambres, F&B et Salles</span>
            <span className="text-emerald-500 font-bold">En exploitation</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dépenses de Fonctionnement</span>
          <h3 className="text-3xl font-extrabold font-serif text-rose-600 mt-2">
            {stats.totalExp.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[11px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Salaires, Stocks, CIE & SODECI</span>
            <span className="text-rose-500 font-bold">Payé</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Marge Nette Estimée</span>
          <h3 className="text-3xl font-extrabold font-serif text-[#b08b45] mt-2">
            {stats.netMargin}%
          </h3>
          <div className="text-[11px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Trésorerie nette après charges</span>
            <span className={stats.netMargin >= 0 ? "text-[#b08b45] font-bold" : "text-rose-500 font-bold"}>
              {stats.netMargin >= 0 ? "Bénéficiaire" : "Déficitaire"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* REVENUE BREAKDOWN STREAM (Donut Chart SVG) */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Répartition des Flux de Revenus</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                
                {/* Segment Rooms (Blue) */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#0d5ca3" strokeWidth="4.2" 
                  strokeDasharray={`${stats.dashes.room} ${100 - stats.dashes.room}`} 
                  strokeDashoffset="0"
                />

                {/* Segment F&B (Gold) */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#c5a059" strokeWidth="4.2" 
                  strokeDasharray={`${stats.dashes.fnb} ${100 - stats.dashes.fnb}`} 
                  strokeDashoffset={`-${stats.dashes.room}`}
                />

                {/* Segment Events (Indigo) */}
                <circle 
                  cx="18" cy="18" r="15.915" fill="none" 
                  stroke="#6366f1" strokeWidth="4.2" 
                  strokeDasharray={`${stats.dashes.event} ${100 - stats.dashes.event}`} 
                  strokeDashoffset={`-${stats.dashes.room + stats.dashes.fnb}`}
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <span className="text-base font-extrabold font-serif text-slate-800">
                  {stats.totalRev >= 1000000 
                    ? `${(stats.totalRev / 1000000).toFixed(1)}M` 
                    : `${Math.round(stats.totalRev / 1000)}k`}
                </span>
              </div>
            </div>

            {/* Legends & Details */}
            <div className="flex flex-col gap-3 font-semibold text-xs text-slate-650 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="w-3 h-3 rounded bg-[#0d5ca3] shrink-0" />
                <span className="min-w-28 text-slate-700">🏨 Hébergement :</span>
                <span className="font-extrabold text-slate-900 text-right w-full sm:w-auto">
                  {stats.roomRev.toLocaleString("fr-FR")} F ({stats.dashes.room}%)
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="w-3 h-3 rounded bg-[#c5a059] shrink-0" />
                <span className="min-w-28 text-slate-700">🍽️ Restaurant/Bar :</span>
                <span className="font-extrabold text-slate-900 text-right w-full sm:w-auto">
                  {stats.fnbRev.toLocaleString("fr-FR")} F ({stats.dashes.fnb}%)
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="w-3 h-3 rounded bg-[#6366f1] shrink-0" />
                <span className="min-w-28 text-slate-700">🎪 Séminaires/Salles :</span>
                <span className="font-extrabold text-slate-900 text-right w-full sm:w-auto">
                  {stats.eventRev.toLocaleString("fr-FR")} F ({stats.dashes.event}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OCCUPANCY TRENDS BY ROOM TYPE (Horizontal Gauge Chart) */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Taux d'Occupation par Type de Chambre</h3>
          <div className="flex flex-col gap-4 py-2">
            {stats.typeOccupancies.map(t => (
              <div key={t.key} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{t.name}</span>
                  <span className="text-slate-900">
                    {t.pct}% <span className="font-normal text-slate-400">({t.occupied}/{t.total} occupées)</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    style={{ width: `${t.pct}%` }} 
                    className={`h-full rounded-full transition-all duration-700 ${
                      t.pct > 75 ? "bg-amber-500" : t.pct > 35 ? "bg-[#0d5ca3]" : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
