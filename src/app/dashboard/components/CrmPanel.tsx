"use client";

import { useState, useEffect } from "react";

interface CrmPanelProps {
  users: any[];
  onRefresh: () => Promise<void>;
}

export default function CrmPanel({ users, onRefresh }: CrmPanelProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter only CLIENTS
  const clientsList = users.filter(u => u.role === "CLIENT");

  const filteredClients = clientsList.filter(u => {
    const term = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const selectedClient = clientsList.find(u => u.id === selectedClientId);

  const [form, setForm] = useState({
    pillowType: "",
    beverages: "",
    cleaningTime: "",
    dietaryNotes: "",
    points: 0,
    tier: "STANDARD",
  });

  // Load selected client preferences into form
  useEffect(() => {
    if (selectedClient) {
      setForm({
        pillowType: selectedClient.preferences?.pillowType || "",
        beverages: selectedClient.preferences?.beverages || "",
        cleaningTime: selectedClient.preferences?.cleaningTime || "",
        dietaryNotes: selectedClient.preferences?.dietaryNotes || "",
        points: selectedClient.loyalty?.points || 0,
        tier: selectedClient.loyalty?.tier || "STANDARD",
      });
      setSuccess(null);
      setError(null);
    }
  }, [selectedClientId, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch(`/api/users/${selectedClientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            pillowType: form.pillowType || null,
            beverages: form.beverages || null,
            cleaningTime: form.cleaningTime || null,
            dietaryNotes: form.dietaryNotes || null,
          },
          loyalty: {
            points: parseInt(form.points as any) || 0,
            tier: form.tier,
          },
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccess("Profil client et préférences sauvegardés !");
        await onRefresh();
      } else {
        setError(data.message || "Impossible de sauvegarder.");
      }
    } catch (err) {
      setError("Erreur serveur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">CRM Clients, Fidélité & Expérience</h2>
        <p className="text-xs text-slate-550 mt-1">Gérez le carnet d'adresses des clients, suivez leurs préférences personnalisées et attribuez des points de fidélité.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* DIRECTORY LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit max-h-[600px] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-900 font-serif">Annuaire des Visiteurs</h3>
            <input 
              type="text"
              placeholder="Rechercher client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:bg-white w-full"
            />
          </div>

          <div className="divide-y divide-slate-100 flex flex-col font-semibold text-xs">
            {filteredClients.length === 0 ? (
              <p className="text-slate-400 py-3 text-center">Aucun client trouvé.</p>
            ) : (
              filteredClients.map((client) => {
                const isSelected = client.id === selectedClientId;
                const points = client.loyalty?.points || 0;
                const tier = client.loyalty?.tier || "STANDARD";

                let badgeColor = "bg-slate-100 text-slate-600";
                if (tier === "SILVER") badgeColor = "bg-slate-200 text-slate-700";
                if (tier === "GOLD") badgeColor = "bg-amber-100 text-amber-800";
                if (tier === "PLATINUM") badgeColor = "bg-indigo-100 text-indigo-800";

                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`py-3 text-left px-3 rounded-lg transition-all flex items-center justify-between ${
                      isSelected ? "bg-[#0d5ca3]/10 text-slate-900" : "hover:bg-slate-50 text-slate-650"
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-slate-900 uppercase font-serif">{client.name || "Sans nom"}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">{client.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${badgeColor}`}>
                      {tier} ({points} pts)
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PROFILE EDITOR & CRM VISUALIZER */}
        <div className="lg:col-span-2">
          {!selectedClient ? (
            <div className="h-full flex items-center justify-center p-8 bg-white border border-slate-200 rounded-xl text-slate-450 text-xs font-semibold shadow-sm">
              👈 Sélectionnez un client dans l'annuaire pour afficher sa fiche d'identité hôtelière et éditer ses préférences.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-scaleIn">
              
              {/* Profile header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif uppercase">{selectedClient.name}</h3>
                  <span className="text-xs text-slate-450">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Niveau</span>
                    <span className="text-xs font-extrabold text-[#b08b45] uppercase">{form.tier}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solde Points</span>
                    <span className="text-xs font-extrabold text-slate-900">{form.points} points</span>
                  </div>
                </div>
              </div>

              {/* Form editing preferences */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl space-y-3 sm:col-span-2">
                  <h4 className="text-xs font-extrabold text-[#0d5ca3] uppercase tracking-wider">🌟 Fidélité & Programme Loyalty</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-655 font-bold">Niveau d'Accréditation</label>
                      <select
                        value={form.tier}
                        onChange={(e) => setForm({ ...form, tier: e.target.value })}
                        className="p-2 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
                      >
                        <option value="STANDARD">Standard (Bleu)</option>
                        <option value="SILVER">Silver (Argent)</option>
                        <option value="GOLD">Gold (Or)</option>
                        <option value="PLATINUM">Platinum (Platine)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-655 font-bold">Crédit Points de Fidélité</label>
                      <input
                        type="number"
                        value={form.points}
                        onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                        className="p-2 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl space-y-3.5 sm:col-span-2">
                  <h4 className="text-xs font-extrabold text-[#b08b45] uppercase tracking-wider">🛌 Profil de séjour & Préférences</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-655 font-bold">Type d'oreiller préféré</label>
                      <input
                        type="text"
                        placeholder="Ex: Ferme, Plumes, Ergonomique"
                        value={form.pillowType}
                        onChange={(e) => setForm({ ...form, pillowType: e.target.value })}
                        className="p-2 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-655 font-bold">Boissons en chambre</label>
                      <input
                        type="text"
                        placeholder="Ex: Eau plate, Coca-Cola, Jus"
                        value={form.beverages}
                        onChange={(e) => setForm({ ...form, beverages: e.target.value })}
                        className="p-2 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-655 font-bold">Horaire Ménage souhaité</label>
                      <input
                        type="text"
                        placeholder="Ex: Avant 10h00, 14h00-16h00"
                        value={form.cleaningTime}
                        onChange={(e) => setForm({ ...form, cleaningTime: e.target.value })}
                        className="p-2 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-655 font-bold">Régime alimentaire & Notes diététiques</label>
                    <textarea
                      rows={3}
                      placeholder="Indiquez les allergies ou exigences culinaires (ex: Sans gluten, végétalien, pas de piment...)"
                      value={form.dietaryNotes}
                      onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                      className="p-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {success && <p className="p-2 rounded bg-emerald-50 border border-emerald-250 text-emerald-700 sm:col-span-2">{success}</p>}
                {error && <p className="p-2 rounded bg-rose-50 border border-rose-250 text-rose-700 sm:col-span-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="sm:col-span-2 py-2.5 rounded bg-gradient-to-r from-[#0d5ca3] to-[#1e40af] text-white font-bold uppercase transition-all shadow-sm flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sauvegarder la fiche client"
                  )}
                </button>
              </form>

              {/* Guest reviews list */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider">✍️ Avis & Notes d'exploitation</h4>
                <div className="flex flex-col gap-3">
                  {!selectedClient.reviews || selectedClient.reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold py-2">Cet invité n'a pas encore laissé d'avis sur l'établissement.</p>
                  ) : (
                    selectedClient.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-3 rounded-lg border border-slate-150 bg-slate-50/50 text-xs font-semibold">
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 rounded text-[8px] bg-slate-150 text-slate-700 uppercase">{rev.category}</span>
                          <span className="text-[#b08b45] font-bold text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                        </div>
                        <p className="text-slate-750 font-normal leading-relaxed">"{rev.comment}"</p>
                        <span className="text-[9px] text-slate-400 font-normal block mt-1">Laissé le {new Date(rev.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
