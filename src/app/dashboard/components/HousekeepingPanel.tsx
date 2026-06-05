"use client";

import { useState } from "react";

interface HousekeepingPanelProps {
  rooms: any[];
  onRoomStatusChange: (roomId: string, newStatus: string) => Promise<void>;
}

export default function HousekeepingPanel({ rooms, onRoomStatusChange }: HousekeepingPanelProps) {
  const [filterType, setFilterType] = useState<string>("DIRTY_OR_SAV");
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);

  const cleaningCount = rooms.filter(r => r.status === "CLEANING").length;
  const maintenanceCount = rooms.filter(r => r.status === "MAINTENANCE").length;
  const availableCount = rooms.filter(r => r.status === "AVAILABLE").length;
  const occupiedCount = rooms.filter(r => r.status === "OCCUPIED").length;

  const filteredRooms = rooms.filter(r => {
    if (filterType === "CLEANING") return r.status === "CLEANING";
    if (filterType === "MAINTENANCE") return r.status === "MAINTENANCE";
    if (filterType === "DIRTY_OR_SAV") return r.status === "CLEANING" || r.status === "MAINTENANCE";
    return true; // Show all rooms
  });

  const handleResolve = async (roomId: string, currentStatus: string) => {
    setLoadingRoomId(roomId);
    try {
      // Set to AVAILABLE
      await onRoomStatusChange(roomId, "AVAILABLE");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoomId(null);
    }
  };

  const handleTriggerStatus = async (roomId: string, status: string) => {
    setLoadingRoomId(roomId);
    try {
      await onRoomStatusChange(roomId, status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoomId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Registre du Housekeeping & Maintenance</h2>
        <p className="text-xs text-slate-550 mt-1">Supervisez l'état de propreté et les réparations techniques des chambres en temps réel.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setFilterType("CLEANING")}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === "CLEANING" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Nettoyage</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{cleaningCount} ch.</span>
        </button>

        <button 
          onClick={() => setFilterType("MAINTENANCE")}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === "MAINTENANCE" ? "border-rose-500 bg-rose-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Réparation</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{maintenanceCount} ch.</span>
        </button>

        <button 
          onClick={() => setFilterType("DIRTY_OR_SAV")}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === "DIRTY_OR_SAV" ? "border-amber-500 bg-amber-50/30" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tâches Actives</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{cleaningCount + maintenanceCount} tâches</span>
        </button>

        <button 
          onClick={() => setFilterType("ALL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === "ALL" ? "border-slate-500 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponibles / Occupées</span>
          <span className="text-sm font-bold text-slate-700 mt-2 block">
            {availableCount} Libres | {occupiedCount} Occupées
          </span>
        </button>
      </div>

      {/* Task List Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-serif">Files d'attente d'intervention</h3>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-full font-bold text-slate-500">
            {filteredRooms.length} chambres listées
          </span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-450 text-xs font-semibold">
            🎉 Aucune intervention nécessaire dans ce filtre. Toutes les chambres sont en règle.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const isCleaning = room.status === "CLEANING";
              const isMaintenance = room.status === "MAINTENANCE";
              const isAvailable = room.status === "AVAILABLE";
              const isOccupied = room.status === "OCCUPIED";

              let label = "Prêt / Libre";
              let colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
              if (isCleaning) {
                label = "Nettoyage en cours";
                colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
              } else if (isMaintenance) {
                label = "Réparation (Hors Service)";
                colorClass = "bg-rose-50 text-rose-700 border-rose-200";
              } else if (isOccupied) {
                label = "Chambre Occupée";
                colorClass = "bg-[#c5a059]/10 text-[#b08b45] border-[#c5a059]/20";
              }

              return (
                <div key={room.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between min-h-36 transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold font-serif text-slate-900">Ch. {room.number}</span>
                      <span className="block text-[9px] font-bold text-slate-450 uppercase mt-0.5">
                        {room.roomType?.name}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${colorClass}`}>
                      {label}
                    </span>
                  </div>

                  {/* Operational actions */}
                  <div className="flex gap-2 mt-auto">
                    {(isCleaning || isMaintenance) ? (
                      <button
                        disabled={loadingRoomId === room.id}
                        onClick={() => handleResolve(room.id, room.status)}
                        className="flex-1 py-1.5 rounded text-[10px] font-extrabold bg-[#0d5ca3] text-white hover:bg-[#0d5ca3]/90 transition-all flex items-center justify-center shadow-sm disabled:opacity-50"
                      >
                        {loadingRoomId === room.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isCleaning ? (
                          "🧹 Valider Ménage (Libérer)"
                        ) : (
                          "🛠️ Terminer Travaux (Libérer)"
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          disabled={loadingRoomId === room.id}
                          onClick={() => handleTriggerStatus(room.id, "CLEANING")}
                          className="flex-1 py-1.5 rounded text-[9px] font-bold border border-slate-250 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-50"
                        >
                          🧼 Signaler Sale
                        </button>
                        <button
                          disabled={loadingRoomId === room.id}
                          onClick={() => handleTriggerStatus(room.id, "MAINTENANCE")}
                          className="flex-1 py-1.5 rounded text-[9px] font-bold border border-slate-250 text-rose-600 bg-rose-50/20 hover:bg-rose-50 transition-all disabled:opacity-50"
                        >
                          🔧 Mettre en Réparation
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
