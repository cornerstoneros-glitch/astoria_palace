import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/transactions - Retrieve financial transactions
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const category = searchParams.get("category");


    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: transactions });
  } catch (error: any) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Log a new transaction (invoice, payment, refund, expense)
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, status, description, userId, category } = body;


    if (amount === undefined || !type) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: amount, type" },
        { status: 400 }
      );
    }

    // Verify User exists if provided
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return NextResponse.json(
          { status: "error", message: "User not found" },
          { status: 404 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        status: status || "PENDING",
        description,
        userId: userId || null,
        category: category || "GENERAL",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ status: "success", data: transaction }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to log transaction" },
      { status: 500 }
    );
  }
}
