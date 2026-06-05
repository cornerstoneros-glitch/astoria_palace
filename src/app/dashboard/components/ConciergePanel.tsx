"use client";

import { useState } from "react";

interface ConciergePanelProps {
  concierge: any[];
  rooms: any[];
  onStatusChange: (reqId: string, status: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ConciergePanel({ concierge, rooms, onStatusChange, onRefresh }: ConciergePanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ACTIVE");
  const [loadingReqId, setLoadingReqId] = useState<string | null>(null);

  // Form states
  const [newRequest, setNewRequest] = useState({
    roomNumber: "",
    type: "ROOM_SERVICE",
    description: "",
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // Group concierge items
  const activeRequests = concierge.filter(c => c.status !== "COMPLETED" && c.status !== "CANCELLED");
  const completedRequests = concierge.filter(c => c.status === "COMPLETED");

  const filteredRequests = concierge.filter(c => {
    if (filterStatus === "ACTIVE") return c.status !== "COMPLETED" && c.status !== "CANCELLED";
    if (filterStatus === "PENDING") return c.status === "PENDING";
    if (filterStatus === "IN_PROGRESS") return c.status === "IN_PROGRESS";
    if (filterStatus === "COMPLETED") return c.status === "COMPLETED";
    return true; // Show all
  });

  const handleUpdateStatus = async (reqId: string, status: string) => {
    setLoadingReqId(reqId);
    try {
      await onStatusChange(reqId, status);
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReqId(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!newRequest.roomNumber) {
      setError("Le numéro de chambre est obligatoire.");
      return;
    }
    if (!newRequest.description) {
      setError("La description de la demande est requise.");
      return;
    }

    setLoadingForm(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRequest,
          site: "Hôtel Astoria Palace",
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess("Demande de conciergerie enregistrée avec succès !");
        setNewRequest({ roomNumber: "", type: "ROOM_SERVICE", description: "" });
        await onRefresh();
      } else {
        setError(data.message || "Impossible de créer la demande.");
      }
    } catch (err) {
      setError("Erreur serveur lors de l'enregistrement de la demande.");
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Console Conciergerie & Service de Chambre</h2>
        <p className="text-xs text-slate-550 mt-1">Supervisez et validez les demandes d'assistance, services en chambre et commissions formulées par les clients.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* REQUESTS LIST COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">Demandes Actives</h3>
            
            {/* Filter Pill switches */}
            <div className="flex gap-1.5 text-[10px] font-bold">
              <button 
                onClick={() => setFilterStatus("ACTIVE")}
                className={`px-2.5 py-1 rounded-full border ${
                  filterStatus === "ACTIVE" ? "bg-[#0d5ca3] text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Actives ({activeRequests.length})
              </button>
              <button 
                onClick={() => setFilterStatus("PENDING")}
                className={`px-2.5 py-1 rounded-full border ${
                  filterStatus === "PENDING" ? "bg-amber-500 text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                En attente
              </button>
              <button 
                onClick={() => setFilterStatus("IN_PROGRESS")}
                className={`px-2.5 py-1 rounded-full border ${
                  filterStatus === "IN_PROGRESS" ? "bg-indigo-500 text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                En cours
              </button>
              <button 
                onClick={() => setFilterStatus("COMPLETED")}
                className={`px-2.5 py-1 rounded-full border ${
                  filterStatus === "COMPLETED" ? "bg-slate-200 text-slate-700 border-transparent" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Résolues ({completedRequests.length})
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-450 text-xs font-semibold">
                Aucune demande enregistrée dans cette catégorie.
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isPending = req.status === "PENDING";
                const isInProgress = req.status === "IN_PROGRESS";
                const isCompleted = req.status === "COMPLETED";

                let icon = "🛎️";
                let typeLabel = "Service Général";
                if (req.type === "ROOM_SERVICE") {
                  icon = "🍽️";
                  typeLabel = "Repas / Boissons";
                } else if (req.type === "MAINTENANCE") {
                  icon = "🛠️";
                  typeLabel = "Panne / Technique";
                } else if (req.type === "TOWELS") {
                  icon = "🧹";
                  typeLabel = "Linge de chambre";
                } else if (req.type === "WAKE_UP_CALL") {
                  icon = "⏰";
                  typeLabel = "Service Réveil";
                } else if (req.type === "TAXI") {
                  icon = "🚖";
                  typeLabel = "Transfert / Taxi";
                }

                let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                if (isInProgress) badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                if (isCompleted) badgeColor = "bg-slate-50 text-slate-400 border-slate-200";

                const dateStr = new Date(req.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) + " (" + new Date(req.createdAt).toLocaleDateString("fr-FR") + ")";

                return (
                  <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold">
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl mt-0.5">{icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#0d5ca3]/15 text-[#0d5ca3] uppercase">{typeLabel}</span>
                          <span className="text-slate-655 font-bold">Chambre {req.roomNumber}</span>
                        </div>
                        <p className="text-slate-900 text-sm font-bold leading-normal">{req.description}</p>
                        <span className="text-[10px] text-slate-400 block mt-1.5 font-normal">Reçu à : {dateStr}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 border text-[9px] font-extrabold uppercase rounded ${badgeColor}`}>
                        {req.status}
                      </span>

                      {!isCompleted && (
                        <div className="flex gap-1.5">
                          {isPending && (
                            <button
                              disabled={loadingReqId === req.id}
                              onClick={() => handleUpdateStatus(req.id, "IN_PROGRESS")}
                              className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-750 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                            >
                              ⚡ Prendre en charge
                            </button>
                          )}
                          <button
                            disabled={loadingReqId === req.id}
                            onClick={() => handleUpdateStatus(req.id, "COMPLETED")}
                            className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center min-w-16"
                          >
                            {loadingReqId === req.id ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "✅ Clôturer"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LOG MANUAL REQUEST FORM */}
        <div>
          <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Créer un Ticket d'Intervention</h3>
          <form onSubmit={handleFormSubmit} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 text-xs font-semibold">
            {error && <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">{error}</div>}
            {success && <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{success}</div>}

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Chambre Associée</label>
              <select 
                required
                value={newRequest.roomNumber}
                onChange={(e) => setNewRequest({ ...newRequest, roomNumber: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="">Sélectionner une chambre...</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.number}>N° {r.number} ({r.roomType?.name})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Type de Service</label>
              <select 
                required
                value={newRequest.type}
                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="ROOM_SERVICE">Service en Chambre (F&B)</option>
                <option value="MAINTENANCE">Requête de Réparation (SAV)</option>
                <option value="TOWELS">Lavage / Serviettes / Draps</option>
                <option value="WAKE_UP_CALL">Appel Réveil</option>
                <option value="TAXI">Commande Taxi / Navette</option>
                <option value="OTHER">Autre commission</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Description de la commission</label>
              <textarea 
                required
                rows={4}
                placeholder="Indiquez les détails de l'intervention (ex: Apporter 2 serviettes de piscine propres, Commande d'un poulet braisé, etc.)"
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loadingForm}
              className="py-2.5 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-bold uppercase transition-all shadow-sm flex items-center justify-center"
            >
              {loadingForm ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Créer le ticket"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
