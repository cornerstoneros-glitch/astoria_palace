"use client";

import { useState } from "react";

interface Room {
  id: string;
  number: string;
  status: string;
  cleaningStatus?: string; // DIRTY, CLEANING, CLEAN
  roomType?: {
    name: string;
  };
}

interface HousekeepingPanelProps {
  rooms: Room[];
  onRefresh: () => void;
}

export default function HousekeepingPanel({ rooms, onRefresh }: HousekeepingPanelProps) {
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);

  // Group rooms by floor (assuming first digit is floor)
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.number.length === 3 ? room.number[0] : "RDC";
    const floorName = floor === "RDC" ? "Rez-de-chaussée" : `Étage ${floor}`;
    if (!acc[floorName]) acc[floorName] = [];
    acc[floorName].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Sort floors
  const sortedFloors = Object.keys(roomsByFloor).sort();

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    setLoadingRoomId(roomId);
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cleaningStatus: newStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setLoadingRoomId(null);
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "DIRTY": return { label: "À nettoyer", color: "bg-rose-500", border: "border-rose-600", text: "text-white" };
      case "CLEANING": return { label: "En cours", color: "bg-amber-400", border: "border-amber-500", text: "text-slate-900" };
      case "CLEAN": 
      default: return { label: "Propre", color: "bg-emerald-500", border: "border-emerald-600", text: "text-white" };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-24">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Module Housekeeping</h2>
        <p className="text-xs text-slate-550">Gestion de l'entretien et du nettoyage des chambres.</p>
      </div>

      <div className="flex gap-4 mb-2">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /> <span className="text-xs font-bold text-slate-600">À nettoyer</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> <span className="text-xs font-bold text-slate-600">En cours</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-xs font-bold text-slate-600">Propre</span></div>
      </div>

      {sortedFloors.map(floor => (
        <div key={floor} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0d5ca3] mb-4 border-b border-slate-200 pb-2">
            {floor}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {roomsByFloor[floor].sort((a,b) => a.number.localeCompare(b.number)).map(room => {
              const currentStatus = room.cleaningStatus || "CLEAN";
              const config = getStatusConfig(currentStatus);
              const isLoading = loadingRoomId === room.id;

              return (
                <div key={room.id} className={`flex flex-col rounded-xl border-b-4 shadow-sm overflow-hidden transition-transform transform hover:-translate-y-1 ${config.color} ${config.border}`}>
                  <div className="p-3 flex justify-between items-start">
                    <span className={`text-2xl font-serif font-black ${config.text} drop-shadow-sm`}>{room.number}</span>
                    {isLoading && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                  </div>
                  
                  <div className="px-3 pb-2 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text} opacity-90`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-white/95 p-1 flex items-center justify-between gap-1 backdrop-blur-sm">
                    <button 
                      disabled={isLoading || currentStatus === "DIRTY"}
                      onClick={() => handleStatusChange(room.id, "DIRTY")}
                      className={`flex-1 py-2 rounded text-lg flex items-center justify-center transition-colors ${currentStatus === "DIRTY" ? "bg-rose-100 text-rose-300 cursor-not-allowed" : "text-rose-500 hover:bg-rose-50"}`}
                      title="Marquer comme Sale"
                    >
                      🧹
                    </button>
                    <button 
                      disabled={isLoading || currentStatus === "CLEANING"}
                      onClick={() => handleStatusChange(room.id, "CLEANING")}
                      className={`flex-1 py-2 rounded text-lg flex items-center justify-center transition-colors ${currentStatus === "CLEANING" ? "bg-amber-100 text-amber-300 cursor-not-allowed" : "text-amber-500 hover:bg-amber-50"}`}
                      title="En cours de nettoyage"
                    >
                      ⏳
                    </button>
                    <button 
                      disabled={isLoading || currentStatus === "CLEAN"}
                      onClick={() => handleStatusChange(room.id, "CLEAN")}
                      className={`flex-1 py-2 rounded text-lg flex items-center justify-center transition-colors ${currentStatus === "CLEAN" ? "bg-emerald-100 text-emerald-300 cursor-not-allowed" : "text-emerald-500 hover:bg-emerald-50"}`}
                      title="Marquer comme Propre"
                    >
                      ✨
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
