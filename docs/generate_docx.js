const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const GOLD = "B8860B";
const DARK = "1A1A2E";
const ACCENT = "2C3E6B";
const LIGHT_GOLD = "F5EFD7";
const LIGHT_BLUE = "EAF0F8";
const WHITE = "FFFFFF";
const GRAY = "666666";
const LIGHT_GRAY = "F2F4F7";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: ACCENT })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: DARK })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: ACCENT })]
  });
}

function para(text, options = {}) {
  return new Paragraph({
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 120, line: 320 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: options.color || "333333", bold: options.bold || false, italics: options.italic || false })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60, line: 300 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333" })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60, line: 300 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333" })]
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 80 } }));
}

function sectionBox(title, color = LIGHT_BLUE) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    shading: { fill: color, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: GOLD } },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: "  " + title, font: "Arial", size: 24, bold: true, color: DARK })]
  });
}

function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: ACCENT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: WHITE })]
          })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: "Arial", size: 20, color: "333333" })]
          })]
        }))
      }))
    ]
  });
}

// ============================================================
// COVER PAGE
// ============================================================
const coverPage = [
  new Paragraph({ spacing: { before: 2000, after: 0 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: "★ ★ ★ ★ ★", font: "Arial", size: 36, color: GOLD })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: "HÔTEL ASTORIA PALACE", font: "Arial", size: 52, bold: true, color: DARK })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: "Yopougon — Abidjan, Côte d'Ivoire", font: "Arial", size: 26, color: GRAY, italics: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
    children: []
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "CAHIER DES CHARGES", font: "Arial", size: 44, bold: true, color: ACCENT })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: "Système de Gestion Hôtelière Intégré (SGHI)", font: "Arial", size: 28, color: GOLD, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 600 },
    children: [new TextRun({ text: "Application de Centre de Gestion Intégral du Complexe Hôtelier", font: "Arial", size: 24, color: GRAY, italics: true })]
  }),
  new Table({
    width: { size: 7200, type: WidthType.DXA },
    columnWidths: [2800, 4400],
    rows: [
      ["Référence", "CDC-ASTORIA-SGHI-001"],
      ["Version", "1.0 — Édition Initiale"],
      ["Date", "Juin 2026"],
      ["Localisation", "Yopougon, Abidjan, Côte d'Ivoire"],
      ["Client", "Hôtel Astoria Palace"],
      ["Statut", "Document de Référence"],
    ].map((row, i) => new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 2800, type: WidthType.DXA },
          shading: { fill: ACCENT, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          children: [new Paragraph({ children: [new TextRun({ text: row[0], font: "Arial", size: 20, bold: true, color: WHITE })] })]
        }),
        new TableCell({
          borders,
          width: { size: 4400, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? LIGHT_GOLD : WHITE, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          children: [new Paragraph({ children: [new TextRun({ text: row[1], font: "Arial", size: 20, color: DARK })] })]
        })
      ]
    }))
  }),
  new Paragraph({ children: [new PageBreak()] })
];

// ============================================================
// DOCUMENT BODY
// ============================================================
const body = [

  // ---- SOMMAIRE INDICATIF ----
  h1("SOMMAIRE"),
  ...["1. Présentation du Projet et Contexte", "2. Objectifs Généraux", "3. Périmètre Fonctionnel", "4. Module Réception & Gestion des Chambres", "5. Module Restauration & Cuisine", "6. Module Piscine & Loisirs", "7. Module Bars & Boissons", "8. Module Salles de Spectacle & Réunions", "9. Module Ressources Humaines & Paie", "10. Module Comptabilité & Finance", "11. Module Marketing & Fidélisation", "12. Module Reporting & Business Intelligence", "13. Exigences Techniques & Infrastructure", "14. Sécurité & Conformité", "15. Plan de Déploiement & Formation", "16. Maintenance & Support", "17. Annexes (Annexe A : Glossaire, Annexe B : Matrice des Rôles, Annexe C : Modèle de Données Prisma)"].map(item => new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: item, font: "Arial", size: 22, color: "444444" })]
  })),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 1
  // ============================================================
  h1("1. PRÉSENTATION DU PROJET ET CONTEXTE"),

  h2("1.1 Identification du Commanditaire"),
  makeTable(
    ["Paramètre", "Détail"],
    [
      ["Dénomination", "Hôtel Astoria Palace"],
      ["Localisation", "Yopougon, Abidjan, Côte d'Ivoire"],
      ["Catégorie visée", "Hôtel 4 à 5 étoiles (standing supérieur)"],
      ["Capacité d'hébergement", "70 chambres toutes catégories"],
      ["Infrastructures", "Cuisine professionnelle, Piscine, Bars (multiple), Salles de spectacle & réunions"],
      ["Marché cible", "Clientèle affaires, tourisme haut de gamme, événementiel"],
      ["Zone géographique", "Yopougon & Grand Abidjan"],
    ],
    [3200, 5760]
  ),
  ...spacer(1),

  h2("1.2 Contexte et Enjeux"),
  para("L'Hôtel Astoria Palace s'inscrit dans la dynamique de croissance du secteur hôtelier ivoirien, portée par l'essor économique d'Abidjan et le développement du tourisme d'affaires en Afrique de l'Ouest. Yopougon, commune la plus peuplée d'Abidjan avec plus d'un million d'habitants, représente un marché stratégique encore insuffisamment doté en hébergement haut de gamme."),
  para("Le complexe hôtelier, par sa diversité d'offres — hébergement, restauration, loisirs et événementiel — constitue un écosystème multi-activités dont la gestion manuelle ou fragmentée représenterait un risque opérationnel et financier majeur. La mise en place d'un Système de Gestion Hôtelière Intégré (SGHI) est donc une nécessité stratégique."),

  h2("1.3 Problématiques Identifiées"),
  bullet("Fragmentation des données entre les différents pôles du complexe (hébergement, F&B, événementiel)"),
  bullet("Absence de vision consolidée en temps réel sur la performance globale"),
  bullet("Risques d'erreurs dans la facturation multi-services et la gestion des inventaires"),
  bullet("Difficulté à fidéliser la clientèle sans outil CRM dédié"),
  bullet("Complexité de la gestion RH dans un environnement multi-shifts et multi-départements"),
  bullet("Conformité aux exigences réglementaires ivoiriennes (ARTCI, DGI, Ministère du Tourisme)"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 2
  // ============================================================
  h1("2. OBJECTIFS GÉNÉRAUX"),

  h2("2.1 Vision Stratégique"),
  para("Le SGHI de l'Hôtel Astoria Palace doit constituer le système nerveux central du complexe, assurant la fluidité des opérations, la cohérence des données et la performance économique de l'ensemble des activités."),

  h2("2.2 Objectifs Opérationnels"),
  numbered("Centraliser la gestion de l'intégralité des activités du complexe en une plateforme unifiée"),
  numbered("Optimiser le taux d'occupation des chambres et des espaces événementiels"),
  numbered("Contrôler et réduire les coûts opérationnels (F&B, énergie, personnel)"),
  numbered("Améliorer l'expérience client à chaque point de contact"),
  numbered("Assurer la traçabilité complète de toutes les transactions financières"),
  numbered("Produire des rapports de gestion fiables pour la direction"),
  numbered("Garantir la conformité réglementaire et fiscale ivoirienne"),
  ...spacer(1),

  h2("2.3 Objectifs Quantifiés (KPIs Cibles)"),
  makeTable(
    ["Indicateur", "Valeur Cible", "Délai"],
    [
      ["Taux d'occupation chambres", "> 75% annuel moyen", "Année 2"],
      ["RevPAR (Revenue per Available Room)", "Optimisé via yield management", "Année 1"],
      ["Réduction temps check-in/out", "< 3 minutes", "Dès déploiement"],
      ["Coût matières F&B", "< 32% du CA restauration", "Année 1"],
      ["Score satisfaction client", "> 4,2 / 5", "Année 1"],
      ["Taux de fidélisation", "> 30%", "Année 2"],
      ["Écarts de caisse", "< 0,1%", "Dès déploiement"],
    ],
    [3800, 3000, 2360]
  ),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 3
  // ============================================================
  h1("3. PÉRIMÈTRE FONCTIONNEL GLOBAL"),

  h2("3.1 Architecture Modulaire"),
  para("Le système est organisé en modules fonctionnels interconnectés, chacun autonome dans ses fonctions spécifiques mais partageant une base de données centralisée. Cette architecture garantit la cohérence des données et permet une évolution progressive de la plateforme."),
  ...spacer(1),

  makeTable(
    ["Module", "Périmètre", "Priorité"],
    [
      ["M1 — PMS (Property Management)", "Réservations, chambres, check-in/out, facturation", "CRITIQUE"],
      ["M2 — Restauration & Cuisine", "Menu, commandes, stock cuisine, coût matière", "CRITIQUE"],
      ["M3 — Piscine & Loisirs", "Accès, réservations, consommations, sécurité", "HAUTE"],
      ["M4 — Bars & Boissons", "POS bar, stocks, happy hours, facturation", "HAUTE"],
      ["M5 — Salles & Événementiel", "Réservation espaces, devis, gestion événements", "HAUTE"],
      ["M6 — RH & Paie", "Plannings, présences, paie, formations", "HAUTE"],
      ["M7 — Comptabilité & Finance", "Comptabilité générale, trésorerie, fiscalité", "CRITIQUE"],
      ["M8 — CRM & Marketing", "Fidélisation, campagnes, avis clients", "MOYENNE"],
      ["M9 — Reporting & BI", "Tableaux de bord, KPIs, rapports direction", "HAUTE"],
      ["M10 — Technique & Maintenance", "GMAO, énergie, équipements", "MOYENNE"],
    ],
    [3000, 4000, 2160]
  ),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 4
  // ============================================================
  h1("4. MODULE M1 — RÉCEPTION & GESTION DES CHAMBRES (PMS)"),
  sectionBox("🏨  Property Management System — Cœur opérationnel du complexe"),
  ...spacer(1),

  h2("4.1 Gestion du Parc de Chambres"),
  para("L'hôtel dispose de 70 chambres réparties en plusieurs catégories. Le système doit gérer l'intégralité du cycle de vie de chaque chambre."),
  ...spacer(1),
  makeTable(
    ["Catégorie", "Nombre", "Équipements Standard"],
    [
      ["Chambre Standard", "30", "Lit double/twin, clim, TV, WiFi, salle de bain"],
      ["Chambre Supérieure", "20", "Standard + minibar, vue jardin/piscine"],
      ["Junior Suite", "12", "Salon séparé, bureau, baignoire, coffre-fort"],
      ["Suite Exécutive", "6", "Living room, kitchenette, terrasse privée"],
      ["Suite Présidentielle", "2", "2 chambres, salon, jacuzzi, service butler"],
      ["TOTAL", "70", "—"],
    ],
    [3000, 1800, 4360]
  ),
  ...spacer(1),

  h2("4.2 Fonctionnalités du Système de Réservation"),
  h3("4.2.1 Moteur de Réservation"),
  bullet("Réservation en ligne multi-canaux : site officiel, OTA (Booking.com, Expedia, Airbnb Luxe), appel téléphonique, walk-in"),
  bullet("Channel Manager intégré pour synchronisation temps réel des disponibilités sur toutes les plateformes"),
  bullet("Système de yield management dynamique : tarification automatique selon taux d'occupation et saisonnalité"),
  bullet("Gestion des tarifs par type (rack rate, corporate, groupe, promotion, last minute)"),
  bullet("Politique d'annulation et de modification configurable par type de tarif"),
  bullet("Garantie de réservation : empreinte CB, acompte via mobile money (Orange Money, MTN MoMo, Wave)"),
  bullet("Gestion des réservations groupes avec rooming list"),
  bullet("Liste d'attente et gestion des surréservations (overbooking contrôlé)"),

  h3("4.2.2 Planning et Housekeeping"),
  bullet("Tableau de bord visuel (heatmap) : disponibilités, occupations, départs, arrivées en temps réel"),
  bullet("Affectation automatique des chambres selon préférences client et disponibilité"),
  bullet("Gestion du statut housekeeping : Libre-propre, Libre-sale, Occupé-propre, En nettoyage, Bloquée, Maintenance"),
  bullet("Application mobile housekeeping pour les femmes de chambre (mise à jour statut en temps réel)"),
  bullet("Gestion des équipes de nettoyage avec attribution des tâches et suivi de productivité"),
  bullet("Rapport d'inspection chambre avec photos (avant/après), checklist qualité"),
  bullet("Gestion du linge : suivi envoi/retour blanchisserie, inventaire"),
  bullet("Détection automatique des retards de nettoyage avec alertes superviseur"),

  h3("4.2.3 Processus Check-in & Check-out"),
  bullet("Check-in rapide < 3 minutes : scan CNI/passeport, préenregistrement en ligne (web check-in)"),
  bullet("Émission de carte clé électronique (RFID/NFC) directement depuis la réception"),
  bullet("Remise de bienvenue personnalisée selon profil client (VIP, fidélité, anniversaire)"),
  bullet("Pre-authorization bancaire automatique à l'arrivée"),
  bullet("Check-out express : règlement en chambre via app, facturation automatique de tous les extras"),
  bullet("Facture détaillée multi-format (PDF, email, papier) avec TVA conforme aux normes DGI-CI"),
  bullet("Gestion des départs tardifs et des arrivées anticipées (early check-in / late check-out)"),

  h2("4.3 Gestion des Extras et de la Facturation Chambre"),
  bullet("Rattachement automatique des consommations (restaurant, bar, piscine, spa) à la chambre"),
  bullet("Système de facturation séparée ou groupée (individuel, entreprise, groupe)"),
  bullet("Gestion des notes de débit automatiques (mini-bar, téléphone, blanchisserie)"),
  bullet("Facturation inter-société et facturation directe agence de voyage"),
  bullet("Gestion des avoirs, remises et gratuités avec justification et validation hiérarchique"),
  bullet("Interface avec la caisse principale pour clôture journalière"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 5
  // ============================================================
  h1("5. MODULE M2 — RESTAURATION & CUISINE"),
  sectionBox("🍽️  Food & Beverage Management — Cuisine, Restaurant & Room Service"),
  ...spacer(1),

  h2("5.1 Infrastructure F&B du Complexe"),
  makeTable(
    ["Point de Vente", "Capacité", "Service"],
    [
      ["Restaurant Principal", "120 couverts", "Petit-déjeuner, Déjeuner, Dîner"],
      ["Restaurant Piscine (Pool Bar)", "40 couverts", "Déjeuner léger, Snacks"],
      ["Room Service", "70 chambres", "24h/24, 7j/7"],
      ["Banquets & Réceptions", "Jusqu'à 300 personnes", "Événementiel sur devis"],
      ["Cuisine Centrale", "Professionnelle", "Production pour tous les points"],
    ],
    [3000, 2000, 4160]
  ),
  ...spacer(1),

  h2("5.2 Gestion des Menus et de la Carte"),
  bullet("Création et gestion des menus par période (petit-déjeuner, déjeuner, dîner, brunch)"),
  bullet("Gestion des cartes saisonnières avec dates de validité"),
  bullet("Fiches techniques recettes : ingrédients, grammages, coût unitaire, coût portion, prix de vente, marge"),
  bullet("Gestion des allergènes par plat (conformité internationale)"),
  bullet("Menu engineering : analyse ABC/XYZ de la performance de chaque plat (étoile, vache à lait, énigme, poids mort)"),
  bullet("Gestion des menus spéciaux : végétarien, halal, sans gluten, régime médical"),
  bullet("Intégration des prix en FCFA avec gestion de la TVA restauration"),

  h2("5.3 Système de Prise de Commandes"),
  bullet("Tablettes/PDA serveurs pour prise de commandes sans contact, envoi direct en cuisine"),
  bullet("Système de Kitchen Display System (KDS) : écrans en cuisine par poste (chaud, froid, pâtisserie)"),
  bullet("Gestion des modificateurs de plats : cuissons, garnitures, suppléments, allergènes"),
  bullet("Gestion des tables : plan de salle interactif, réservation de tables, historique client"),
  bullet("Système de tickets cuisine avec horodatage et alertes de dépassement de temps"),
  bullet("Communication bidirectionnelle salle-cuisine pour statuts commandes"),

  h2("5.4 Gestion des Stocks Cuisine & Approvisionnement"),
  bullet("Stock central avec gestion multi-dépôts (cuisine froide, cuisine sèche, cave à vins, boissons)"),
  bullet("Inventaire en temps réel avec valorisation CMUP (Coût Moyen Unitaire Pondéré)"),
  bullet("Saisie des réceptions fournisseurs : bon de livraison, contrôle qualité, écarts"),
  bullet("Gestion des fournisseurs locaux ivoiriens et approvisionnements import"),
  bullet("Calcul automatique des besoins en fonction des réservations et des événements planifiés"),
  bullet("Alertes stock minimum, stock de sécurité, produits périmés (FIFO/FEFO)"),
  bullet("Suivi du coût matière en temps réel avec objectif ≤ 32% du CA"),
  bullet("Gestion des pertes et destructions avec validation du chef"),
  bullet("Rapports hebdomadaires/mensuels coût matière par famille de produits"),

  h2("5.5 Room Service"),
  bullet("Commandes via application chambre (TV interactive, tablette, QR code)"),
  bullet("Suivi de la livraison en temps réel avec horodatage départ cuisine / arrivée chambre"),
  bullet("Gestion des plateaux et équipements (assiettes, couverts) avec suivi retour"),
  bullet("Facturation automatique sur la note de chambre"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 6
  // ============================================================
  h1("6. MODULE M3 — PISCINE & LOISIRS"),
  sectionBox("🏊  Gestion de la Piscine et des Espaces Bien-être"),
  ...spacer(1),

  h2("6.1 Gestion des Accès Piscine"),
  bullet("Contrôle d'accès par bracelet RFID ou badge (résidents vs visiteurs extérieurs)"),
  bullet("Tarification différenciée : résidents hôtel (inclus ou offert), clients extérieurs (journée, demi-journée)"),
  bullet("Suivi de la capacité en temps réel avec alerte de dépassement (sécurité balnéaire)"),
  bullet("Réservation de créneaux horaires et de zones (bassins, jacuzzi, bar piscine)"),

  h2("6.2 Gestion des Services Piscine"),
  bullet("Location de transats, parasols, serviettes : suivi des rotations et facturation"),
  bullet("Inventaire et suivi du matériel balnéaire (coussins, équipements aquatiques)"),
  bullet("Gestion du pool bar : commandes directement au transat, facturation chambre ou comptant"),
  bullet("Planification des séances de natation, aquagym, cours privés"),
  bullet("Réservation et facturation des services spa/massage si extension future"),

  h2("6.3 Maintenance et Sécurité Piscine"),
  bullet("Journal de bord technique : relevés pH, chlore, température (2x/jour minimum)"),
  bullet("Alertes automatiques si paramètres hors normes avec action corrective requise"),
  bullet("Planning de nettoyage et maintenance préventive"),
  bullet("Registre de présence du maître-nageur sauveteur (MNS) — exigence réglementaire"),
  bullet("Gestion des incidents balnéaires avec rapport circonstanciel"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 7
  // ============================================================
  h1("7. MODULE M4 — BARS & BOISSONS"),
  sectionBox("🍸  Gestion Multi-Bar — POS, Stocks, Événements"),
  ...spacer(1),

  h2("7.1 Points de Vente Bar"),
  makeTable(
    ["Bar", "Localisation", "Spécificité"],
    [
      ["Bar Lobby", "Hall d'accueil", "Cocktails signature, café, snacks haut de gamme"],
      ["Pool Bar", "Bord piscine", "Boissons fraîches, cocktails tropicaux, snacks légers"],
      ["Sky Bar / Rooftop", "Terrasse (si applicable)", "Spiritueux premium, vins, soirées thématiques"],
      ["Bar Événementiel", "Salles de réunion/spectacle", "Service lors des événements, cocktails dînatoires"],
    ],
    [2400, 2800, 4000]
  ),
  ...spacer(1),

  h2("7.2 Fonctionnalités POS Bar"),
  bullet("Caisse tactile intuitive avec plan de salle et gestion des tables/tabourets"),
  bullet("Gestion des happy hours : plages horaires, promotions automatiques, produits concernés"),
  bullet("Facturation multi-modes : espèces FCFA, carte bancaire, mobile money, débit chambre"),
  bullet("Gestion des offerts et consommations personnel avec justification et quotas"),
  bullet("Split de notes entre clients, fusion de tables"),
  bullet("Impression ticket thermique + envoi facture par email/SMS"),

  h2("7.3 Gestion des Stocks et de la Cave"),
  bullet("Stock différencié par bar avec transferts inter-bars traçables"),
  bullet("Gestion de la cave à vins : références, millésimes, température, rotation"),
  bullet("Suivi des bouteilles ouvertes et mesure des pertes (pour les vins au verre)"),
  bullet("Ratios de consommation théoriques vs réels pour détecter les anomalies"),
  bullet("Gestion des cocktails comme recettes avec décomposition coût ingrédients"),
  bullet("Alertes réapprovisionnement et gestion des commandes fournisseurs boissons"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 8
  // ============================================================
  h1("8. MODULE M5 — SALLES DE SPECTACLE & RÉUNIONS"),
  sectionBox("🎭  Gestion de l'Événementiel et des Espaces Privatisables"),
  ...spacer(1),

  h2("8.1 Inventaire des Espaces"),
  makeTable(
    ["Espace", "Capacité", "Configuration", "Équipements"],
    [
      ["Salle Prestige (Grand)", "300 pers.", "Théâtre, banquet, cocktail", "Scène, éclairage scénique, sono professionnelle"],
      ["Salle Conférence A", "80 pers.", "Théâtre, classe, U, boardroom", "Vidéoprojecteur 4K, visioconférence, micro-cravates"],
      ["Salle Conférence B", "40 pers.", "Classe, U, boardroom", "Écran interactif, WiFi dédié, paperboard"],
      ["Salon VIP", "20 pers.", "Boardroom, cocktail", "TV 75, climatisation renforcée, bar intégré"],
      ["Espace Cocktail / Foyer", "150 pers.", "Cocktail dînatoire", "Adjacent à la Salle Prestige"],
    ],
    [2200, 1600, 2400, 3000]
  ),
  ...spacer(1),

  h2("8.2 Gestion des Réservations d'Espaces"),
  bullet("Calendrier de disponibilité en temps réel pour chaque espace"),
  bullet("Moteur de devis automatisé : sélection espace, durée, services complémentaires (traiteur, technique, hôtesses, fleurs)"),
  bullet("Gestion des contrats événementiels : devis → proposition → acompte → confirmation → facturation"),
  bullet("Planning de montage/démontage avec affectation des équipes techniques"),
  bullet("Gestion des prestataires externes agréés (sound designers, décorateurs, animateurs)"),
  bullet("Suivi des cautions et remboursements"),

  h2("8.3 Services Événementiels Intégrés"),
  bullet("Gestion du catering événementiel : menus buffet, cocktails, coordination avec la cuisine"),
  bullet("Gestion de l'accueil : liste des invités, badges, contrôle d'accès événement"),
  bullet("Coordination du service bar événementiel : dotations boissons, facturation à la consommation"),
  bullet("Gestion des équipements audiovisuels : réservation, installation, technicien dédié"),
  bullet("Billetterie intégrée pour les spectacles et concerts (si applicable)"),
  bullet("Facturation post-événement consolidée avec tous les services consommés"),

  h2("8.4 Types d'Événements Gérés"),
  bullet("Conférences d'entreprise, séminaires, formations, lancements produits"),
  bullet("Mariages, fiançailles, anniversaires, baptêmes"),
  bullet("Concerts, spectacles, soirées thématiques, galas"),
  bullet("Dîners d'affaires, cocktails dînatoires, networking events"),
  bullet("Assemblées générales, conseils d'administration"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 9
  // ============================================================
  h1("9. MODULE M6 — RESSOURCES HUMAINES & PAIE"),
  sectionBox("👥  Gestion du Personnel Multi-Départements"),
  ...spacer(1),

  h2("9.1 Gestion Administrative du Personnel"),
  bullet("Dossier employé complet : état civil, contrat, diplômes, certifications, historique disciplinaire"),
  bullet("Gestion des types de contrats : CDI, CDD, saisonnier, stagiaire, prestataire (conformité Code du Travail CI)"),
  bullet("Organigramme dynamique par département (Hébergement, F&B, Technique, Administration, Sécurité)"),
  bullet("Suivi des périodes d'essai avec alertes de renouvellement ou confirmation"),
  bullet("Gestion des visites médicales et conformités réglementaires (médecine du travail)"),

  h2("9.2 Planification et Gestion des Temps"),
  bullet("Planificateur de shifts : matin, après-midi, nuit, week-end — pour chaque département"),
  bullet("Gestion des équipes tournantes en conformité avec la durée légale du travail ivoirienne"),
  bullet("Pointage électronique : badge RFID, biométrie ou application mobile"),
  bullet("Calcul automatique des heures supplémentaires, majorations nuit/dimanche/férié"),
  bullet("Gestion des congés : congés payés, maladie, maternité, sans solde — balance automatique"),
  bullet("Alertes absence non justifiée avec déclenchement de la procédure RH"),
  bullet("Tableau de bord présence en temps réel pour les responsables de service"),

  h2("9.3 Paie et Rémunération"),
  bullet("Calcul automatique des salaires selon la convention collective hôtellerie-restauration CI"),
  bullet("Gestion des composantes de rémunération : salaire de base, primes, commissions, avantages en nature"),
  bullet("Calcul et déclaration des charges sociales (CNPS, CGRAE selon statut)"),
  bullet("Génération des bulletins de paie conformes aux normes DGI-CI"),
  bullet("Virement des salaires via virement bancaire ou mobile money (Orange Money, MTN MoMo, Wave)"),
  bullet("Déclaration fiscale IR et états de synthèse pour la comptabilité"),

  h2("9.4 Formation et Développement"),
  bullet("Plan de formation annuel par département et par poste"),
  bullet("Suivi des certifications obligatoires (hygiène HACCP, premiers secours, sécurité incendie)"),
  bullet("Évaluations de performance trimestrielles avec grilles d'appréciation par métier"),
  bullet("Gestion des plans de carrière et promotions internes"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 10
  // ============================================================
  h1("10. MODULE M7 — COMPTABILITÉ & FINANCE"),
  sectionBox("💰  Gestion Financière Intégrée — Normes SYSCOHADA & DGI-CI"),
  ...spacer(1),

  h2("10.1 Comptabilité Générale"),
  bullet("Plan comptable SYSCOHADA révisé (applicable en Côte d'Ivoire)"),
  bullet("Saisie comptable automatique depuis les modules opérationnels (PMS, F&B, RH)"),
  bullet("Gestion multi-journaux : ventes, achats, banque, caisse, OD"),
  bullet("Lettrage automatique des comptes et rapprochement bancaire"),
  bullet("États financiers automatisés : bilan, compte de résultat, tableau de flux"),
  bullet("Clôture mensuelle et annuelle avec archivage sécurisé 10 ans"),

  h2("10.2 Trésorerie et Caisses"),
  bullet("Gestion multi-caisses par point de vente avec solde de caisse en temps réel"),
  bullet("Clôture journalière automatique : Z de caisse, récapitulatif par mode de paiement"),
  bullet("Gestion du fond de caisse et des avances à justifier"),
  bullet("Intégration des paiements mobile money : Orange Money, MTN MoMo, Wave avec réconciliation automatique"),
  bullet("Gestion des devises étrangères (EUR, USD) avec taux de change paramétrable"),
  bullet("Tableau de trésorerie prévisionnel sur 13 semaines"),

  h2("10.3 Facturation et Créances"),
  bullet("Facturation électronique normalisée DGI (e-facture) si requis"),
  bullet("Gestion des clients en compte : crédit hôtel, facturation différée entreprises"),
  bullet("Suivi des créances par ancienneté (30, 60, 90 jours) avec relances automatiques"),
  bullet("Gestion des litiges et contentieux"),

  h2("10.4 Contrôle de Gestion"),
  bullet("Budget par département avec suivi mensuel des écarts (Budget vs Réel)"),
  bullet("Analyse des coûts par centre de profit : hébergement, restauration, événementiel, piscine, bars"),
  bullet("Seuil de rentabilité par activité"),
  bullet("Tableau de bord financier direction : CA journalier, marges, charges, trésorerie"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 11
  // ============================================================
  h1("11. MODULE M8 — CRM, MARKETING & FIDÉLISATION"),
  sectionBox("🎯  Gestion de la Relation Client et de la Marque"),
  ...spacer(1),

  h2("11.1 Base de Données Clients (CRM)"),
  bullet("Fiche client 360° : historique des séjours, préférences, habitudes de consommation"),
  bullet("Segmentation client : corporate, loisir, VIP, groupe, agence de voyage"),
  bullet("Détection automatique des clients réguliers avec alerte réception à l'arrivée"),
  bullet("Gestion de la confidentialité et conformité RGPD (applicable aux clients internationaux)"),

  h2("11.2 Programme de Fidélité"),
  bullet("Programme de points : accumulation sur toutes les dépenses (chambres, F&B, spa, événements)"),
  bullet("Niveaux de fidélité : Membre, Silver, Gold, Platinum avec avantages croissants"),
  bullet("Récompenses : nuits offertes, upgrades, accès lounge, priorité de réservation"),
  bullet("Application mobile client : consultation des points, réservations, menu, services"),

  h2("11.3 Marketing Digital"),
  bullet("Gestion des campagnes email/SMS ciblées selon profil et historique"),
  bullet("Intégration réseaux sociaux : publication automatique d'offres, monitoring réputation"),
  bullet("Gestion des avis en ligne (Google, TripAdvisor, Booking) avec réponses centralisées"),
  bullet("Analyse des sources de réservation pour optimisation du mix marketing"),
  bullet("Gestion des offres promotionnelles et codes promo avec tracking"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 12
  // ============================================================
  h1("12. MODULE M9 — REPORTING & BUSINESS INTELLIGENCE"),
  sectionBox("📊  Tableaux de Bord et Aide à la Décision"),
  ...spacer(1),

  h2("12.1 Tableaux de Bord Direction"),
  bullet("Dashboard exécutif en temps réel : CA journalier, taux d'occupation, RevPAR, GOP"),
  bullet("Vue consolidée multi-département avec drill-down par activité"),
  bullet("Comparatifs période N vs N-1, objectifs vs réalisé, benchmarks sectoriels"),
  bullet("Alertes automatiques si indicateur hors seuil paramétré"),

  h2("12.2 Rapports Opérationnels"),
  makeTable(
    ["Rapport", "Fréquence", "Destinataire"],
    [
      ["Rapport Nuitées (arrivals/departures)", "Quotidien", "Directeur Hébergement"],
      ["Rapport Chiffre d'Affaires global", "Quotidien", "Direction Générale, DG"],
      ["Rapport Food Cost", "Hebdomadaire", "Chef Cuisine, F&B Manager"],
      ["Rapport Stocks & Inventaires", "Hebdomadaire", "Économat, F&B Manager"],
      ["Rapport Ressources Humaines", "Mensuel", "DRH, Direction"],
      ["Compte de Résultat Analytique", "Mensuel", "DAF, Direction"],
      ["Rapport de Satisfaction Client", "Mensuel", "Direction, Marketing"],
      ["Rapport Technique & Maintenance", "Mensuel", "Responsable Technique"],
      ["Bilan Annuel & Business Review", "Annuel", "Direction Générale, Actionnaires"],
    ],
    [3600, 1800, 3760]
  ),
  ...spacer(1),

  h2("12.3 Statistiques Hôtelières Standards"),
  bullet("Taux d'occupation (TO%), RevPAR, ADR (Average Daily Rate), TRevPAR"),
  bullet("Durée moyenne de séjour (DMS), délai moyen de réservation"),
  bullet("Part de marché par canal de distribution"),
  bullet("Analyse de la saisonnalité et des événements spéciaux"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 13
  // ============================================================
  h1("13. EXIGENCES TECHNIQUES & INFRASTRUCTURE"),
  sectionBox("⚙️  Architecture Technique — Robustesse et Disponibilité 99,9%"),
  ...spacer(1),

  h2("13.1 Architecture Logicielle"),
  bullet("Architecture web/cloud-hybride : serveur principal sur site + backup cloud (résilience)"),
  bullet("Application web responsive basée sur le framework Next.js (React 19, TypeScript)"),
  bullet("Base de données relationnelle locale robuste gérée par l'ORM Prisma (Prisma Client JS)"),
  bullet("Moteur de base de données local basé sur SQLite (via Better-SQLite3) garantissant un fonctionnement hors ligne résilient"),
  bullet("Applications mobiles/périphériques connectés interagissant directement avec l'API REST/Next.js"),
  bullet("Système de synchronisation bidirectionnelle périodique avec le serveur de sauvegarde cloud"),
  bullet("Multitenant natif au niveau de l'architecture de la base de données (séparation logique par Site)"),

  h2("13.2 Infrastructure Matérielle Recommandée"),
  makeTable(
    ["Équipement", "Quantité", "Usage"],
    [
      ["Serveur principal (on-premise)", "1 + 1 backup", "Base de données, application centrale"],
      ["NAS (stockage réseau)", "1", "Archivage données, sauvegarde locale"],
      ["Terminaux POS tactiles", "8 minimum", "Réception (2), Restaurant (3), Bars (3)"],
      ["Tablettes Android (10\")", "15", "Serveurs restaurant (6), Housekeeping (6), Managers (3)"],
      ["Imprimantes tickets thermiques", "8", "Réception, cuisine, bars, pool bar"],
      ["Lecteurs cartes RFID", "4", "Réception check-in/out, accès piscine"],
      ["Écrans KDS cuisine", "3", "Chaud, froid, pâtisserie"],
      ["Onduleurs (UPS)", "4", "Serveur, réception, cuisine, sécurité"],
      ["Réseau WiFi professionnel", "Couverture totale", "Chambres, salles, piscine, bars"],
      ["Connexion Internet principale", "Fibre optique 100 Mbps+", "Opérations, OTA, cloud"],
      ["Connexion Internet backup", "4G/LTE dédié", "Continuité si fibre indisponible"],
    ],
    [3200, 2000, 3960]
  ),
  ...spacer(1),

  h2("13.3 Contraintes Environnementales Abidjan"),
  bullet("Gestion des coupures de courant fréquentes : groupe électrogène obligatoire, UPS pour tous les équipements critiques"),
  bullet("Connexion Internet redondante : fibre principale + 4G backup avec basculement automatique"),
  bullet("Climatisation renforcée pour la salle serveur (température < 22°C en permanence)"),
  bullet("Protection contre les surtensions électriques (parasurtenseurs sur tous les équipements)"),
  bullet("Système de sauvegarde locale ET cloud avec RPO < 1 heure et RTO < 4 heures"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 14
  // ============================================================
  h1("14. SÉCURITÉ & CONFORMITÉ"),
  sectionBox("🔒  Protection des Données, Conformité Légale CI & Sécurité Informatique"),
  ...spacer(1),

  h2("14.1 Sécurité Informatique"),
  bullet("Authentification multi-facteurs (MFA) pour tous les accès administrateurs"),
  bullet("Gestion des rôles et permissions granulaires : Directeur Général, Directeur d'exploitation, Chef de Réception, Caissier, Serveur, Économe, Housekeeping, etc."),
  bullet("Chiffrement des données sensibles en transit (TLS 1.3) et au repos (AES-256)"),
  bullet("Journal d'audit complet : toutes les actions utilisateurs tracées avec horodatage"),
  bullet("Politique de mots de passe renforcée et rotation périodique obligatoire"),
  bullet("Sauvegardes chiffrées quotidiennes avec test de restauration mensuel"),
  bullet("Antivirus et firewall sur tous les équipements du réseau hôtelier"),

  h2("14.2 Conformité Réglementaire Ivoirienne"),
  bullet("ARTCI : conformité à la loi n°2013-451 relative à la cybersécurité et à la protection des données personnelles"),
  bullet("DGI-CI : facturation électronique normalisée, déclarations fiscales automatisées"),
  bullet("Ministère du Tourisme CI : conformité aux normes de classement hôtelier"),
  bullet("CNPS/CGRAE : génération automatique des états de déclaration des charges sociales"),
  bullet("Archives comptables : conservation sécurisée 10 ans minimum conformément au droit OHADA"),
  bullet("Gestion des livres de police (registre des clients étrangers) — obligation réglementaire hôtellerie CI"),

  h2("14.3 Gestion de la Confidentialité des Clients"),
  bullet("Consentement client explicite pour la collecte et l'utilisation des données"),
  bullet("Droit à l'oubli et à la portabilité des données sur demande"),
  bullet("Anonymisation des données clients après 3 ans d'inactivité"),
  bullet("Interdiction de revente de données clients à des tiers"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 15
  // ============================================================
  h1("15. PLAN DE DÉPLOIEMENT & FORMATION"),
  sectionBox("🚀  Mise en Œuvre Progressive sur 6 Mois"),
  ...spacer(1),

  makeTable(
    ["Phase", "Durée", "Activités", "Modules"],
    [
      ["Phase 0 — Initialisation", "Semaines 1-2", "Audit existant, paramétrage général, installation infrastructure", "Infrastructure"],
      ["Phase 1 — Cœur Métier", "Semaines 3-6", "Déploiement PMS, Comptabilité, RH de base. Formation équipe réception.", "M1, M7, M6"],
      ["Phase 2 — F&B", "Semaines 7-10", "Déploiement Cuisine, Bars, Room Service. Formation F&B.", "M2, M4"],
      ["Phase 3 — Loisirs & Events", "Semaines 11-14", "Piscine, Salles réunion, Événementiel. Formation équipes.", "M3, M5"],
      ["Phase 4 — CRM & BI", "Semaines 15-18", "Fidélisation, Marketing, Reporting avancé, Dashboards Direction.", "M8, M9"],
      ["Phase 5 — Stabilisation", "Semaines 19-24", "Go-live complet, ajustements, formation continue, hypercare.", "Tous modules"],
    ],
    [2200, 1600, 3400, 1960]
  ),
  ...spacer(1),

  h2("15.2 Programme de Formation"),
  bullet("Formation initiale obligatoire pour chaque profil utilisateur (réception, cuisine, bar, housekeeping, direction)"),
  bullet("Manuels utilisateurs en français adaptés au contexte ivoirien"),
  bullet("Sessions de formation en présentiel à l'hôtel (pas de déplacement requis)"),
  bullet("Formation des super-utilisateurs (relais internes) pour support de premier niveau"),
  bullet("Recyclage formation à chaque mise à jour majeure"),
  bullet("Support hotline en français pendant les 6 premiers mois post-déploiement"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 16
  // ============================================================
  h1("16. MAINTENANCE, SUPPORT & ÉVOLUTIVITÉ"),

  h2("16.1 Contrat de Maintenance"),
  makeTable(
    ["Niveau", "Délai d'intervention", "Couverture"],
    [
      ["P1 — Critique (système inaccessible)", "< 1 heure", "24h/24 — 7j/7"],
      ["P2 — Majeur (module non fonctionnel)", "< 4 heures", "Jours ouvrables 7h-20h"],
      ["P3 — Mineur (anomalie non bloquante)", "< 24 heures", "Jours ouvrables"],
      ["P4 — Amélioration / évolution", "Planifié", "Sur devis"],
    ],
    [2400, 2400, 4360]
  ),
  ...spacer(1),

  h2("16.2 Mises à Jour et Évolutions"),
  bullet("Mises à jour de sécurité : déploiement sous 72h en cas de vulnérabilité critique"),
  bullet("Mises à jour fonctionnelles : planifiées en période creuse avec notification 48h avant"),
  bullet("Feuille de route produit partagée annuellement avec le client"),
  bullet("Procédure de rollback documentée en cas de régression"),

  h2("16.3 Scalabilité"),
  bullet("Architecture capable d'accueillir une extension du parc hôtelier (ajout de chambres ou d'établissements)"),
  bullet("Modules additionnels activables : spa, golf, navette aéroport, boutique, coworking"),
  bullet("Migration possible vers un modèle SaaS multi-établissements si le groupe se développe"),
  ...spacer(1),
  new Paragraph({ children: [new PageBreak()] }),

  // ============================================================
  // CHAPITRE 17 — ANNEXES
  // ============================================================
  h1("17. ANNEXES"),

  h2("Annexe A — Glossaire"),
  makeTable(
    ["Terme", "Définition"],
    [
      ["ADR", "Average Daily Rate — Tarif journalier moyen"],
      ["RevPAR", "Revenue Per Available Room — Revenu par chambre disponible"],
      ["GOP", "Gross Operating Profit — Résultat brut d'exploitation"],
      ["PMS", "Property Management System — Logiciel de gestion hôtelière"],
      ["POS", "Point of Sale — Caisse enregistreuse / terminal de vente"],
      ["KDS", "Kitchen Display System — Écran d'affichage cuisine"],
      ["F&B", "Food & Beverage — Restauration et boissons"],
      ["CRM", "Customer Relationship Management — Gestion de la relation client"],
      ["RFID", "Radio-Frequency Identification — Identification par radiofréquence (badges)"],
      ["HACCP", "Hazard Analysis Critical Control Points — Normes sécurité alimentaire"],
      ["SYSCOHADA", "Système Comptable OHADA — Plan comptable applicable en CI"],
      ["ARTCI", "Autorité de Régulation des Télécommunications de Côte d'Ivoire"],
      ["CMUP", "Coût Moyen Unitaire Pondéré — Méthode de valorisation des stocks"],
      ["RPO", "Recovery Point Objective — Perte de données maximale tolérée"],
      ["RTO", "Recovery Time Objective — Durée maximale d'indisponibilité tolérée"],
    ],
    [2400, 6760]
  ),
  ...spacer(2),

  h2("Annexe B — Matrice des Profils Utilisateurs"),
  makeTable(
    ["Profil", "Modules Accessibles", "Niveau d'accès"],
    [
      ["Directeur Général", "Tous modules", "Lecture/Écriture/Validation/Configuration"],
      ["Directeur d'Exploitation", "M1, M2, M3, M4, M5, M6, M9", "Lecture/Écriture/Validation"],
      ["Chef de Réception", "M1, M8", "Lecture/Écriture"],
      ["Réceptionniste", "M1 (partiel), M8 (partiel)", "Opérationnel"],
      ["Gouvernante", "M1 (Housekeeping)", "Mise à jour statuts"],
      ["F&B Manager", "M2, M4", "Lecture/Écriture/Validation"],
      ["Chef de Cuisine", "M2", "Lecture/Écriture"],
      ["Serveur / Barman", "M2 (POS), M4 (POS)", "Saisie commandes"],
      ["Responsable Événements", "M5", "Lecture/Écriture"],
      ["DRH", "M6", "Lecture/Écriture/Validation"],
      ["DAF / Comptable", "M7, M9", "Lecture/Écriture/Validation"],
      ["Responsable Marketing", "M8, M9 (partiel)", "Lecture/Écriture"],
      ["Technicien", "M10", "Mise à jour interventions"],
      ["Auditeur / Contrôleur", "M7, M9", "Lecture seule"],
    ],
    [2600, 3800, 2760]
  ),
  ...spacer(2),

  h2("Annexe C — Modèle de Données Conceptuel (Prisma ORM)"),
  para("L'architecture logicielle du SGHI repose sur l'ORM Prisma pour la modélisation et la manipulation des données. Ce choix garantit la cohérence des relations et facilite l'accès aux données. Le modèle conceptuel est structuré autour des entités suivantes :"),
  ...spacer(1),
  makeTable(
    ["Modèle / Table", "Description & Relations", "Attributs Clés"],
    [
      ["Site", "Représente un complexe hôtelier (Yopougon, etc.). Relie les chambres, les services et le personnel.", "id (String, cuid), name (String), location, description"],
      ["RoomType", "Catégorie de chambres (Standard, Supérieure, Suite, etc.) avec tarification et capacité.", "id (String, cuid), name (String), price (Float), capacity (Int)"],
      ["Room", "Chambre individuelle associée à un type et un site. Statuts: AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE.", "id (String, cuid), number (String), status (String), roomTypeId, siteId"],
      ["Reservation", "Séjour réservé par un client pour une chambre. Statuts: PENDING, CONFIRMED, CANCELLED, COMPLETED.", "id (String, cuid), checkIn (DateTime), checkOut (DateTime), status, totalPrice, roomId, clientId"],
      ["KycData", "Données réglementaires d'identification (ARTCI). Lié à une réservation.", "id (String, cuid), idType (CNI, Passeport), idNumber, idImage"],
      ["User", "Compte utilisateur avec rôle d'accès (CLIENT, ADMIN, STAFF).", "id (String, cuid), email, name, password, role"],
      ["Staff", "Personnel relié à un compte utilisateur, un site et un poste (Receptionist, Manager, etc.).", "id (String, cuid), userId, siteId, position"],
      ["Service", "Prestations disponibles sur un site (Restaurant, Piscine, Spa, Loisirs, etc.).", "id (String, cuid), name, price, siteId"],
      ["InventoryItem", "Suivi des stocks F&B et gouvernance avec seuil d'alerte.", "id (String, cuid), name, category, quantity, unit, minThreshold, siteId"],
      ["Dish & Component", "Menu du restaurant : plats (Signature, Terroir, Tradition) et composants (PROTEIN, GARNISH, etc.).", "id (String, cuid), name, price, isActive, type, optional"],
      ["Transaction", "Flux financiers associés à un utilisateur (facturation, encaissement, remboursement).", "id (String, cuid), amount, type (INVOICE, PAYMENT, REFUND), status"],
      ["ConciergeRequest", "Requêtes de maintenance ou room service créées par les clients ou le personnel.", "id (String, cuid), type, status (PENDING, IN_PROGRESS, COMPLETED)"]
    ],
    [2400, 4800, 2000]
  ),
  ...spacer(2),

  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
    children: [new TextRun({ text: "— Fin du Document —", font: "Arial", size: 22, italics: true, color: GRAY })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: "Hôtel Astoria Palace | Système de Gestion Hôtelière Intégré | CDC-ASTORIA-SGHI-001 | Juin 2026", font: "Arial", size: 18, color: GRAY })]
  }),
];

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } }
            }
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "o",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 1440, hanging: 360 } }
            }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } }
            }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Hôtel Astoria Palace — Cahier des Charges SGHI",
                  size: 16,
                  color: GRAY,
                  font: "Arial"
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Page ",
                  size: 16,
                  color: GRAY,
                  font: "Arial"
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: GRAY,
                  font: "Arial"
                }),
                new TextRun({
                  text: " sur ",
                  size: 16,
                  color: GRAY,
                  font: "Arial"
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: GRAY,
                  font: "Arial"
                })
              ]
            })
          ]
        })
      },
      children: [
        ...coverPage,
        ...body
      ]
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Cahier_des_Charges_Astoria_Palace.docx", buffer);
  console.log("Document generated successfully.");
}).catch((err) => {
  console.error("Error generating document:", err);
});
