import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/night-audit - Retrieve details of the last audit
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const reportSetting = await prisma.systemSetting.findUnique({
      where: { key: "LAST_NIGHT_AUDIT_REPORT" },
    });
    
    const lastDateSetting = await prisma.systemSetting.findUnique({
      where: { key: "LAST_NIGHT_AUDIT_DATE" },
    });

    return NextResponse.json({
      status: "success",
      data: {
        report: reportSetting ? JSON.parse(reportSetting.value) : null,
        date: lastDateSetting ? lastDateSetting.value : null,
      },
    });
  } catch (error: any) {
    console.error("GET /api/night-audit error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Impossible de récupérer les infos de clôture" },
      { status: 500 }
    );
  }
}

// POST /api/night-audit - Execute Night Audit (Room rate posting & payroll allocations)
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    // 1. Fetch active ongoing check-ins (CONFIRMED status, checkIn <= today, checkOut >= today)
    const activeReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkIn: { lte: new Date() },
        checkOut: { gte: new Date() },
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });

    let roomRevenuePosted = 0;
    let transactionsCreatedCount = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    for (const res of activeReservations) {
      // Find if we already posted daily room rate for this reservation today to avoid duplicates
      const existingTx = await prisma.transaction.findFirst({
        where: {
          userId: res.clientId,
          category: "RESERVATION",
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          description: {
            contains: `Chambre ${res.room.number}`,
          },
        },
      });

      if (!existingTx) {
        const rate = res.room.roomType.price;
        await prisma.transaction.create({
          data: {
            amount: rate,
            type: "PAYMENT",
            status: "PAID",
            description: `Postage journalier hébergement : Ch. ${res.room.number} (${res.client.name})`,
            userId: res.clientId,
            category: "RESERVATION",
          },
        });
        roomRevenuePosted += rate;
        transactionsCreatedCount++;
      }
    }

    // 2. Fetch all active staff to post salary daily expenses
    const staffMembers = await prisma.staff.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    let salaryExpensesPosted = 0;
    if (staffMembers.length > 0) {
      const totalMonthlySalaries = staffMembers.reduce((sum, s) => sum + s.salary, 0);
      const dailySalaryExpense = Math.round(totalMonthlySalaries / 30);
      
      // Check if already posted today
      const existingSalaryTx = await prisma.transaction.findFirst({
        where: {
          category: "SALARY",
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          description: "Postage quotidien des salaires du personnel",
        },
      });

      if (!existingSalaryTx && dailySalaryExpense > 0) {
        await prisma.transaction.create({
          data: {
            amount: -dailySalaryExpense,
            type: "EXPENSE",
            status: "PAID",
            description: "Postage quotidien des salaires du personnel",
            category: "SALARY",
          },
        });
        salaryExpensesPosted = dailySalaryExpense;
        transactionsCreatedCount++;
      }
    }

    // 3. Assemble report
    const report = {
      auditDate: new Date().toISOString(),
      roomsOccupied: activeReservations.length,
      roomRevenuePosted,
      salaryExpensesPosted,
      transactionsCreatedCount,
    };

    // 4. Save to SystemSettings
    await prisma.systemSetting.upsert({
      where: { key: "LAST_NIGHT_AUDIT_REPORT" },
      update: { value: JSON.stringify(report) },
      create: { key: "LAST_NIGHT_AUDIT_REPORT", value: JSON.stringify(report) },
    });

    await prisma.systemSetting.upsert({
      where: { key: "LAST_NIGHT_AUDIT_DATE" },
      update: { value: new Date().toISOString() },
      create: { key: "LAST_NIGHT_AUDIT_DATE", value: new Date().toISOString() },
    });

    return NextResponse.json({
      status: "success",
      message: "Night audit complété avec succès",
      data: report,
    });
  } catch (error: any) {
    console.error("POST /api/night-audit error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Erreur lors de la clôture journalière" },
      { status: 500 }
    );
  }
}
