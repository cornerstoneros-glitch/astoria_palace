import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { prisma } from './src/lib/prisma'; // Import configured prisma client

async function generateManuals() {
  const outputDir = path.join(__dirname, 'manuels_utilisateurs');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log("Fetching staff members from database...");
  const staffMembers = await prisma.staff.findMany({
    include: {
      user: true,
      site: true
    }
  });

  if (staffMembers.length === 0) {
    console.log("No staff members found in the database. Ensure the seed script has been run.");
    process.exit(1);
  }

  for (const staff of staffMembers) {
    const userName = staff.user?.name || "Employé";
    const position = staff.position || "Staff";
    const siteName = staff.site?.name || "Astoria Palace";

    let roleDescription = "";
    let responsibilities: string[] = [];
    let dashboardInstructions: string[] = [];

    const normalizedPos = position.toLowerCase();

    if (normalizedPos.includes("reception") || normalizedPos.includes("manager") && !normalizedPos.includes("restaurant")) {
      roleDescription = "Vous êtes le premier point de contact de nos invités et l'image de marque de l'établissement.";
      responsibilities = [
        "Gestion des réservations et des arrivées (Check-in/Check-out).",
        "Encaissement et facturation des séjours.",
        "Mise à jour du statut KYC (Cartes d'identité des clients)."
      ];
      dashboardInstructions = [
        "Dans l'onglet 'Réception' (Chambres) : Utilisez la carte interactive (Heatmap) pour voir quelles chambres sont libres ou occupées.",
        "Changez le statut d'une chambre via le menu déroulant (Libre, Occupée, Nettoyage, SAV).",
        "Tape Chart : Ce graphique vous permet de visualiser les réservations sur 14 jours glissants.",
        "Si l'identité d'un client est manquante, utilisez le bouton 'Copier Lien KYC' pour lui envoyer par WhatsApp ou email."
      ];
    } else if (normalizedPos.includes("housekeeping") || normalizedPos.includes("gouvernante")) {
      roleDescription = "Vous êtes le garant de la propreté, du confort et du prestige de nos chambres.";
      responsibilities = [
        "Nettoyage des chambres après le départ des clients.",
        "Vérification de la propreté avant l'arrivée (Check-in).",
        "Remontée des incidents (ampoule grillée, fuite d'eau) à la maintenance."
      ];
      dashboardInstructions = [
        "Sur votre mobile ou tablette, connectez-vous au portail et allez dans l'onglet 'Gouvernante'.",
        "La liste des chambres s'affiche avec des codes couleurs. Concentrez-vous sur les chambres en BLEU (À nettoyer).",
        "Une fois le nettoyage terminé, cliquez sur la chambre et passez son statut à 'PROPRE'. Elle deviendra immédiatement VERT sur l'écran du réceptionniste.",
        "Si vous constatez un problème technique, utilisez le bouton 'Signaler Incident'."
      ];
    } else if (normalizedPos.includes("chef") || normalizedPos.includes("waiter") || normalizedPos.includes("barman") || normalizedPos.includes("restaurant")) {
      roleDescription = "Vous êtes l'artisan de l'expérience culinaire et gastronomique de nos clients.";
      responsibilities = [
        "Prise de commande au restaurant, au bar, ou via le Room Service.",
        "Mise à jour de l'état de préparation des plats.",
        "Gestion du stock des ingrédients de base."
      ];
      dashboardInstructions = [
        "Allez dans l'onglet 'Restaurant & Bar'.",
        "Cliquez sur une table ou sur 'Nouvelle Commande'.",
        "Sélectionnez les plats sur l'interface tactile (POS) et ajoutez des options si le client le demande (ex: Sans piment).",
        "Cliquez sur 'Envoyer en Cuisine'. Une fois le plat servi, vous pourrez générer la facture et l'encaisser."
      ];
    } else {
      roleDescription = "Vous supervisez l'ensemble des opérations de l'établissement.";
      responsibilities = [
        "Validation de la clôture journalière (Night Audit).",
        "Analyse du chiffre d'affaires et des dépenses.",
        "Gestion du personnel et des salaires."
      ];
      dashboardInstructions = [
        "L'onglet 'Analytiques' vous donne une vue d'ensemble du CA et des marges en temps réel.",
        "Utilisez l'onglet 'Comptabilité' pour générer les factures et valider la Main Courante.",
        "L'onglet 'Clôture Journalière' est à exécuter chaque soir à minuit pour purger les chambres et générer le rapport financier de la journée."
      ];
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "ASTORIA PALACE", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
          new Paragraph({ text: `Manuel d'Utilisation SGHI - ${siteName}`, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
          new Paragraph({ children: [new TextRun({ text: `Bonjour ${userName},`, bold: true, size: 28 })], spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: `Ce manuel a été généré spécifiquement pour votre profil. En tant que ` }), new TextRun({ text: position, bold: true }), new TextRun({ text: `, votre rôle est essentiel pour le bon fonctionnement de l'établissement.` })], spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: roleDescription, italics: true })], spacing: { after: 600 } }),
          new Paragraph({ text: "VOS RESPONSABILITÉS PRINCIPALES", heading: HeadingLevel.HEADING_3, spacing: { before: 400, after: 200 } }),
          ...responsibilities.map(r => new Paragraph({ text: r, bullet: { level: 0 } })),
          new Paragraph({ text: "GUIDE D'UTILISATION DU LOGICIEL", heading: HeadingLevel.HEADING_3, spacing: { before: 600, after: 200 } }),
          ...dashboardInstructions.map(inst => new Paragraph({ text: inst, bullet: { level: 0 }, spacing: { after: 100 } })),
          new Paragraph({ children: [new TextRun({ text: "En cas de problème ou de bug technique avec le système, veuillez contacter l'administrateur informatique.", italics: true })], spacing: { before: 800 } })
        ],
      }],
    });

    const safeName = userName.replace(/[^a-zA-Z0-9]/g, '_');
    const safePosition = position.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Manuel_${safeName}_${safePosition}.docx`;
    const filepath = path.join(outputDir, filename);

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filepath, buffer);
    console.log(`Généré : ${filename}`);
  }

  console.log(`\nTous les manuels ont été générés avec succès dans le dossier : ${outputDir}`);
}

generateManuals().catch(e => {
  console.error(e);
  process.exit(1);
});
