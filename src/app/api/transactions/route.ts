import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - Retrieve financial transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

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

// POST /api/transactions - Log a new transaction (invoice, payment, refund)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, status, description, userId } = body;

    if (amount === undefined || !type || !userId) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: amount, type, userId" },
        { status: 400 }
      );
    }

    // Verify User exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        status: status || "PENDING",
        description,
        userId,
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
