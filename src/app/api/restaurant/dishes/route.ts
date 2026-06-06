import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/restaurant/dishes - Retrieve menu dishes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const siteId = searchParams.get("siteId");

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (siteId) where.siteId = siteId;

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        components: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ status: "success", data: dishes });
  } catch (error: any) {
    console.error("GET /api/restaurant/dishes error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

// POST /api/restaurant/dishes - Add a new dish to the menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description, price, image, siteId, components } = body;

    if (!name || !category || !siteId) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: name, category, siteId" },
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

    // Create the dish with nested components if provided
    const dish = await prisma.dish.create({
      data: {
        name,
        category,
        description,
        price,
        image,
        siteId,
        components: components && Array.isArray(components)
          ? {
              create: components.map((c: any) => ({
                name: c.name,
                type: c.type || "OPTION",
                optional: c.optional ?? true,
              })),
            }
          : undefined,
      },
      include: {
        components: true,
      },
    });

    return NextResponse.json({ status: "success", data: dish }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/restaurant/dishes error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create dish" },
      { status: 500 }
    );
  }
}
