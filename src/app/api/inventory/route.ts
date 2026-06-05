import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// GET /api/inventory - List stock inventory
export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const siteId = searchParams.get("siteId");
    const lowStock = searchParams.get("lowStock") === "true";

    const where: any = {};
    if (category) where.category = category;
    if (siteId) where.siteId = siteId;

    let items = await prisma.inventoryItem.findMany({
      where,
      include: {
        site: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filter programmatically for low stock threshold
    if (lowStock) {
      items = items.filter((item: { quantity: number; minThreshold: number }) => item.quantity <= item.minThreshold);
    }

    return NextResponse.json({ status: "success", data: items });
  } catch (error: any) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create or add an inventory item
export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN", "STAFF"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, quantity, unit, minThreshold, siteId } = body;


    if (!name || !category || quantity === undefined || !unit || !siteId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: name, category, quantity, unit, siteId",
        },
        { status: 400 }
      );
    }

    // Verify Site exists
    const siteExists = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!siteExists) {
      return NextResponse.json(
        { status: "error", message: "Site not found" },
        { status: 404 }
      );
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        minThreshold: minThreshold !== undefined ? parseFloat(minThreshold) : 5,
        siteId,
      },
      include: {
        site: true,
      },
    });

    return NextResponse.json({ status: "success", data: item }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create inventory item" },
      { status: 500 }
    );
  }
}
