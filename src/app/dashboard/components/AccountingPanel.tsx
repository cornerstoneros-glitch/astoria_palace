"use client";

import { useState, useMemo } from "react";

interface AccountingPanelProps {
  transactions: any[];
  onRefresh: () => Promise<void>;
}

export default function AccountingPanel({ transactions, onRefresh }: AccountingPanelProps) {
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Manual Transaction Form state
  const [formType, setFormType] = useState<"IN" | "OUT">("OUT"); // IN = Recette, OUT = Dépense
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("GENERAL");
  const [status, setStatus] = useState<string>("PAID");

  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Financial calculations
  const stats = useMemo(() => {
    // 1. Trésorerie Globale (Solde net des transactions payées)
    const treasury = transactions
      .filter(t => t.status === "PAID")
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Encaissements Cumulés (Cash-In payés)
    const cashIn = transactions
      .filter(t => t.status === "PAID" && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // 3. Décaissements Cumulés (Cash-Out payés, valeur absolue)
    const cashOut = transactions
      .filter(t => t.status === "PAID" && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // 4. Créances Clients (Factures en attente)
    const receivables = transactions
      .filter(t => t.status === "PENDING" && t.type === "INVOICE")
      .reduce((sum, t) => sum + t.amount, 0);

    // 5. Ventilation Transversale par Département
    const departments = [
      { key: "RESERVATION", name: "Hébergement (Chambres)", icon: "🏨" },
      { key: "FNB", name: "Restauration & Bar", icon: "🍽️" },
      { key: "EVENTS", name: "Événements & Salles", icon: "🎪" },
      { key: "SALARY", name: "RH & Salaires", icon: "👥" },
      { key: "RESTOCK", name: "Approvisionnements (Stocks)", icon: "📦" },
      { key: "GENERAL_SERVICES", name: "Services & Frais Généraux", icon: "⚡" },
    ];

    const departmentStats = departments.map(d => {
      const isGeneral = d.key === "GENERAL_SERVICES";
      const filterCategory = (t: any) => {
        if (isGeneral) {
          return t.category === "GENERAL" || t.category === "UTILITIES";
        }
        return t.category === d.key;
      };

      const deptTxs = transactions.filter(filterCategory);

      const rec = deptTxs
        .filter(t => t.status === "PAID" && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const exp = deptTxs
        .filter(t => t.status === "PAID" && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const bal = rec - exp;

      const pend = deptTxs
        .filter(t => t.status === "PENDING" && t.type === "INVOICE")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...d,
        revenue: rec,
        expense: exp,
        balance: bal,
        pending: pend,
      };
    });

    return {
      treasury,
      cashIn,
      cashOut,
      receivables,
      departmentStats,
    };
  }, [transactions]);

  // Filtering ledger transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Category filter
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "GENERAL_SERVICES") {
          if (t.category !== "GENERAL" && t.category !== "UTILITIES") return false;
        } else if (t.category !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const user = t.user ? `${t.user.name || ""} ${t.user.email || ""}`.toLowerCase() : "";
        if (!desc.includes(query) && !user.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedCategory, selectedStatus, searchQuery]);

  // Handle Manual Flow Creation
  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Veuillez saisir un montant valide et positif.");
      setLoading(false);
      return;
    }

    // Set negative amount for expenses (OUT direction)
    const finalAmount = formType === "OUT" ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    const finalType = formType === "OUT" ? "EXPENSE" : "PAYMENT";

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          type: finalType,
          status: status,
          description: description,
          category: category,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setFormSuccess("Écriture financière validée et insérée au grand livre !");
        setAmount("");
        setDescription("");
        // Refresh data
        await onRefresh();
      } else {
        setFormError(data.message || "Impossible d'enregistrer l'écriture comptable.");
      }
    } catch (err) {
      setFormError("Erreur de communication avec le serveur comptable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Bilan et Comptabilité Transversale</h2>
        <p className="text-xs text-slate-550 mt-1">Consolidation omnicanale des flux financiers, statistiques de trésorerie par pôle et journal des écritures.</p>
      </div>

      {/* Advanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trésorerie Nette</span>
          <h3 className={`text-2xl font-extrabold font-serif mt-2 ${stats.treasury >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.treasury.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Solde réel en caisses & banques</span>
            <span className={stats.treasury >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
              {stats.treasury >= 0 ? "Bénéficiaire" : "Déficitaire"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recettes Validées (Cash-In)</span>
          <h3 className="text-2xl font-extrabold font-serif text-emerald-600 mt-2">
            + {stats.cashIn.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Flux de caisse entrants</span>
            <span className="text-emerald-500 font-bold">Encaissé</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Décaissements (Cash-Out)</span>
          <h3 className="text-2xl font-extrabold font-serif text-rose-600 mt-2">
            - {stats.cashOut.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Dépenses, salaires & stocks</span>
            <span className="text-rose-500 font-bold">Décaissement</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Créances Clients</span>
          <h3 className="text-2xl font-extrabold font-serif text-amber-600 mt-2">
            {stats.receivables.toLocaleString("fr-FR")} F
          </h3>
          <div className="text-[10px] text-slate-500 mt-2 font-semibold flex items-center justify-between">
            <span>Factures de séjour en attente</span>
            <span className="text-amber-500 font-bold">À percevoir</span>
          </div>
        </div>
      </div>

      {/* Transversal Department breakdown panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-1.5">
          📊 Bilan Transversal de l'Activité par Département
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Département / Pôle</th>
                <th className="px-5 py-3 text-right">Recettes (Cash-In)</th>
                <th className="px-5 py-3 text-right">Dépenses (Cash-Out)</th>
                <th className="px-5 py-3 text-right">Solde Net</th>
                <th className="px-5 py-3 text-right">Encours Clients</th>
                <th className="px-5 py-3 text-center">Indicateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250 font-semibold">
              {stats.departmentStats.map(dept => {
                const isPositive = dept.balance >= 0;
                return (
                  <tr key={dept.key} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-slate-800 flex items-center gap-2">
                      <span className="text-lg">{dept.icon}</span>
                      <span className="font-bold">{dept.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-emerald-600 font-serif">
                      {dept.revenue > 0 ? `+ ${dept.revenue.toLocaleString("fr-FR")} F` : "0 F"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-rose-600 font-serif">
                      {dept.expense > 0 ? `- ${dept.expense.toLocaleString("fr-FR")} F` : "0 F"}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-serif font-extrabold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {dept.balance > 0 ? `+ ${dept.balance.toLocaleString("fr-FR")} F` : `${dept.balance.toLocaleString("fr-FR")} F`}
                    </td>
                    <td className="px-5 py-3.5 text-right text-amber-600 font-serif">
                      {dept.pending > 0 ? `${dept.pending.toLocaleString("fr-FR")} F` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        dept.balance > 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : dept.balance < 0 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {dept.balance > 0 ? "Excédent" : dept.balance < 0 ? "Déficit" : "Équilibré"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* GRAND LIVRE WITH INTERACTIVE FILTERS */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">Grand Livre des Écritures</h3>
            {/* Filter buttons & search */}
            <div className="flex gap-2 flex-wrap">
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tous les pôles</option>
                <option value="RESERVATION">Hébergement</option>
                <option value="FNB">Restauration</option>
                <option value="EVENTS">Événements</option>
                <option value="SALARY">RH / Salaires</option>
                <option value="RESTOCK">Stocks</option>
                <option value="GENERAL_SERVICES">Services / Frais Généraux</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PAID">Payé</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-center">Type</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun mouvement comptable trouvé pour ces critères.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const amountFormatted = t.amount.toLocaleString("fr-FR");
                    const dateFormatted = new Date(t.createdAt).toLocaleDateString("fr-FR");
                    const isPositive = t.amount > 0;
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-slate-500">{dateFormatted}</td>
                        <td className="px-5 py-3 text-slate-900">
                          <div>{t.description}</div>
                          {t.user && (
                            <span className="text-[10px] text-slate-400 font-normal">Saisi pour : {t.user.name || t.user.email}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            t.type === "PAYMENT" 
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                              : t.type === "EXPENSE" 
                              ? "bg-rose-50 border border-rose-200 text-rose-700" 
                              : "bg-blue-50 border border-blue-200 text-blue-700"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            t.status === "PAID" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : t.status === "PENDING" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-serif font-extrabold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? `+ ${amountFormatted}` : `${amountFormatted}`} F
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MANUAL TRANSACTION FLOW LOGGER FORM */}
        <div>
          <h3 className="text-base font-bold text-slate-900 font-serif mb-4">Saisie de Flux (Comptabilité Générale)</h3>
          <form onSubmit={handleCreateFlow} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 text-xs font-semibold">
            {formError && <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{formError}</div>}
            {formSuccess && <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{formSuccess}</div>}

            {/* Income / Expense Switcher Button Group */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setFormType("OUT")}
                className={`flex-1 py-1.5 text-center rounded-md font-bold uppercase transition-all ${
                  formType === "OUT" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                💸 Dépense
              </button>
              <button
                type="button"
                onClick={() => setFormType("IN")}
                className={`flex-1 py-1.5 text-center rounded-md font-bold uppercase transition-all ${
                  formType === "IN" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                📥 Recette
              </button>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-655">Libellé / Description de l'écriture</label>
              <input 
                type="text"
                required
                placeholder={formType === "OUT" ? "Ex: Facture électricité CIE" : "Ex: Vente extra bar terrasse cash"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-655">Montant en FCFA</label>
              <input 
                type="number"
                required
                placeholder="Ex: 75000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category selector */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-655">Pôle / Catégorie</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="GENERAL">Frais Généraux</option>
                  <option value="RESERVATION">Hébergement</option>
                  <option value="FNB">Restauration & Bar</option>
                  <option value="EVENTS">Événements</option>
                  <option value="SALARY">RH / Salaires</option>
                  <option value="RESTOCK">Stocks / Achats</option>
                  <option value="UTILITIES">Énergie / CIE / SODECI</option>
                </select>
              </div>

              {/* Status selector */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-655">État du flux</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="PAID">Réglé (Payé)</option>
                  <option value="PENDING">En attente (Facture)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`py-3 rounded-lg text-white font-extrabold uppercase transition-all shadow-md mt-2 flex items-center justify-center ${
                formType === "OUT" ? "bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-105" : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-105"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Valider l'Écriture"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
