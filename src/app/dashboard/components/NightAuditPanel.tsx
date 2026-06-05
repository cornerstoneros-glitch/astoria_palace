"use client";

import { useState, useEffect } from "react";

interface NightAuditPanelProps {
  settings: any;
  onRefresh: () => Promise<void>;
}

export default function NightAuditPanel({ settings, onRefresh }: NightAuditPanelProps) {
  const [auditReport, setAuditReport] = useState<any>(null);
  const [auditDate, setAuditDate] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [successAudit, setSuccessAudit] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    hotel_name: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    check_in_time: "",
    check_out_time: "",
  });
  const [successSettings, setSuccessSettings] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Fetch last audit report
  const fetchAuditInfo = async () => {
    try {
      const res = await fetch("/api/night-audit");
      const json = await res.json();
      if (json.status === "success") {
        setAuditReport(json.data.report);
        setAuditDate(json.data.date);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditInfo();
  }, []);

  // Update form values when settings prop updates
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSettingsForm({
        hotel_name: settings.hotel_name || "Hôtel Astoria Palace",
        address: settings.address || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        check_in_time: settings.check_in_time || "14:00",
        check_out_time: settings.check_out_time || "11:00",
      });
    }
  }, [settings]);

  const handleRunAudit = async () => {
    setLoadingAudit(true);
    setSuccessAudit(null);
    try {
      const res = await fetch("/api/night-audit", { method: "POST" });
      const json = await res.json();
      if (json.status === "success") {
        setSuccessAudit("Opération réussie ! Le Night Audit a imputé les écritures de la journée.");
        setAuditReport(json.data);
        setAuditDate(json.data.auditDate);
        await onRefresh();
      } else {
        setSuccessAudit(`Erreur : ${json.message}`);
      }
    } catch (err) {
      setSuccessAudit("Erreur de connexion au serveur d'audit.");
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessSettings(null);
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      const json = await res.json();
      if (json.status === "success") {
        setSuccessSettings("Paramètres globaux sauvegardés avec succès !");
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900">Night Audit & Paramètres Système</h2>
        <p className="text-xs text-slate-550 mt-1">Exécutez la clôture comptable journalière et modifiez les constantes de fonctionnement du portail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* NIGHT AUDIT CONTROL */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
              <span>🌙</span> Clôture de Journée (Night Audit)
            </h3>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Le **Night Audit** est l'opération d'exploitation critique qui valide la facturation de la journée. 
              Elle recherche tous les séjours actifs (Check-in confirmé) et génère leur facture journalière correspondante. 
              De plus, elle déduit les fractions journalières des salaires du personnel pour assurer un bilan comptable d'une grande rigueur.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 font-semibold text-xs text-slate-650">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">État du dernier audit</h4>
            
            {auditReport ? (
              <div className="flex flex-col gap-2 font-bold text-slate-800">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-normal text-slate-500">Date d'audit :</span>
                  <span>{new Date(auditDate || "").toLocaleString("fr-FR")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-normal text-slate-500">Nuitées facturées :</span>
                  <span>{auditReport.roomsOccupied} chambres</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-normal text-slate-500">Revenus hébergement imputés :</span>
                  <span className="text-emerald-600 font-serif">+{auditReport.roomRevenuePosted.toLocaleString("fr-FR")} F</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-normal text-slate-500">Dépenses salaires imputées :</span>
                  <span className="text-rose-600 font-serif">-{auditReport.salaryExpensesPosted.toLocaleString("fr-FR")} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-normal text-slate-500">Écritures comptables générées :</span>
                  <span>{auditReport.transactionsCreatedCount} écritures</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-450 italic py-2 text-center">Aucun Night Audit exécuté sur cette session.</p>
            )}
          </div>

          {successAudit && <div className="p-2.5 rounded bg-amber-500/10 border border-[#c5a059]/40 text-[#b08b45] text-xs font-bold">{successAudit}</div>}

          <button
            disabled={loadingAudit}
            onClick={handleRunAudit}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-950 hover:to-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loadingAudit ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>🌙</span>
                <span>Lancer la Clôture & Facturation de Nuit</span>
              </>
            )}
          </button>
        </div>

        {/* SYSTEM CONFIGURATION */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
            <span>⚙️</span> Configuration Globale de l'Hôtel
          </h3>
          
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-slate-655 font-bold">Nom officiel de l'Établissement</label>
              <input
                type="text"
                required
                value={settingsForm.hotel_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, hotel_name: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-slate-655 font-bold">Adresse Géographique</label>
              <input
                type="text"
                required
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">E-mail de Contact</label>
              <input
                type="email"
                required
                value={settingsForm.contact_email}
                onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Téléphone de l'Hôtel</label>
              <input
                type="text"
                required
                value={settingsForm.contact_phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Heure standard d'arrivée (Check-in)</label>
              <input
                type="text"
                required
                value={settingsForm.check_in_time}
                onChange={(e) => setSettingsForm({ ...settingsForm, check_in_time: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-655 font-bold">Heure limite de départ (Check-out)</label>
              <input
                type="text"
                required
                value={settingsForm.check_out_time}
                onChange={(e) => setSettingsForm({ ...settingsForm, check_out_time: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:bg-white"
              />
            </div>

            {successSettings && <p className="p-2.5 rounded bg-emerald-50 border border-emerald-250 text-emerald-700 sm:col-span-2">{successSettings}</p>}

            <button
              type="submit"
              disabled={loadingSettings}
              className="sm:col-span-2 py-3 rounded bg-gradient-to-r from-[#c5a059] to-[#b08b45] text-slate-950 font-extrabold uppercase text-[10px] tracking-wider hover:brightness-105 transition-all shadow-sm flex items-center justify-center"
            >
              {loadingSettings ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sauvegarder la Configuration"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
