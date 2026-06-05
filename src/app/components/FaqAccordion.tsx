"use client";

import { useState } from "react";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quels sont les horaires de Check-in et de Check-out ?",
      a: "Les arrivées (Check-in) se font à partir de 14h00 et les départs (Check-out) doivent être effectués avant 11h00. Une option de départ tardif ou d'arrivée anticipée peut être disponible sur demande."
    },
    {
      q: "L'hôtel propose-t-il un service de navette depuis/vers l'aéroport ?",
      a: "Oui, l'Hôtel Astoria Palace propose un service de transfert privé en navette climatisée depuis et vers l'Aéroport International Félix-Houphouët-Boigny (FHB) d'Abidjan. Ce service est disponible sur réservation (tarif de 35 000 FCFA par trajet)."
    },
    {
      q: "La piscine lagon est-elle accessible aux personnes externes ?",
      a: "Oui, la piscine lagon de l'hôtel est accessible aux résidents gratuitement et aux clients externes via un pass d'accès journée à 5 000 FCFA par personne (serviette de bain incluse)."
    },
    {
      q: "Le parking de l'hôtel est-il sécurisé ?",
      a: "Absolument. L'hôtel dispose d'un grand parking privé entièrement gratuit pour nos résidents et nos clients événementiels, surveillé 24h/24 par notre équipe de sécurité et des caméras de surveillance."
    },
    {
      q: "Quelles sont les options et tarifs pour le petit-déjeuner ?",
      a: "Le petit-déjeuner continental ou traditionnel ivoirien (buffet à volonté) est proposé tous les matins au restaurant Lagon de 06h30 à 10h00. Il est inclus pour les Suites et disponible au tarif de 8 500 FCFA par personne pour les chambres Standard."
    },
    {
      q: "Comment réserver une salle de réception ou un salon VIP ?",
      a: "Vous pouvez réserver nos salons directement depuis la section 'Loisirs & Salles' de la page d'accueil ou en contactant notre service commercial par téléphone (+225 07 00 00 00 00) ou e-mail. Les réservations sont planifiées par tranches horaires."
    }
  ];

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-3 max-w-3xl w-full mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm transition-all">
            <button
              onClick={() => toggleIndex(i)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs md:text-sm text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span>{faq.q}</span>
              <span className={`text-base text-[#c5a059] transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-40 border-t border-slate-100 p-4" : "max-h-0"
              }`}
            >
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
