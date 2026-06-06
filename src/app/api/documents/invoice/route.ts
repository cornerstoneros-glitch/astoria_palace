import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Build DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "HÔTEL ASTORIA PALACE",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Quartier Commerce, Yopougon, Abidjan",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Tel: +225 07 00 00 00 00 | Email: contact@astoriapalace.ci",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: transaction.amount > 0 ? "FACTURE / REÇU" : "BON DE DÉCAISSEMENT",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Numéro de Transaction : ", bold: true }),
              new TextRun({ text: transaction.id }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date : ", bold: true }),
              new TextRun({ text: transaction.createdAt.toLocaleDateString("fr-FR") }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Bénéficiaire / Client : ", bold: true }),
              new TextRun({ text: transaction.user ? (transaction.user.name || transaction.user.email) : "Non spécifié" }),
            ],
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Description", alignment: AlignmentType.CENTER })], shading: { fill: "D9D9D9" } }),
                  new TableCell({ children: [new Paragraph({ text: "Catégorie", alignment: AlignmentType.CENTER })], shading: { fill: "D9D9D9" } }),
                  new TableCell({ children: [new Paragraph({ text: "Montant (FCFA)", alignment: AlignmentType.CENTER })], shading: { fill: "D9D9D9" } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: transaction.description || "", alignment: AlignmentType.LEFT })] }),
                  new TableCell({ children: [new Paragraph({ text: transaction.category, alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: Math.abs(transaction.amount).toLocaleString("fr-FR"), alignment: AlignmentType.RIGHT })] }),
                ],
              })
            ]
          }),
          new Paragraph({
            text: `Total : ${Math.abs(transaction.amount).toLocaleString("fr-FR")} FCFA`,
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: "Signature / Cachet",
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 },
          }),
          new Paragraph({
            text: "Merci de votre confiance. L'équipe Astoria Palace vous souhaite une excellente journée.",
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200 },
          })
        ],
      }],
    });

    // Node environment buffer creation
    const buffer = await Packer.toBuffer(doc);

    const isIncome = transaction.amount > 0;
    const prefix = isIncome ? "Facture" : "Recu";
    const filename = `${prefix}_Astoria_${transaction.id}.docx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });

  } catch (err) {
    console.error("Erreur de génération DOCX:", err);
    return NextResponse.json({ error: "Erreur serveur lors de la génération du document." }, { status: 500 });
  }
}
