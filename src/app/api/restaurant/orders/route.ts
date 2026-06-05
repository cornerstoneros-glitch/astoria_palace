import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/restaurant/orders - Get list of restaurant/bar orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // RESTAURANT, BAR, ROOM_SERVICE
    const status = searchParams.get("status"); // PENDING, SERVED, PAID, CANCELLED

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ status: "success", data: orders });
  } catch (error: any) {
    console.error("GET /api/restaurant/orders error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/restaurant/orders - Record a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tableNumber, roomNumber, items } = body; // items: Array of { dishId, quantity }

    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: type, items (non-empty array)" },
        { status: 400 }
      );
    }

    // 1. Resolve item names and pricing from Dish catalog
    const resolvedItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const dish = await prisma.dish.findUnique({
        where: { id: item.dishId },
      });

      if (!dish) {
        return NextResponse.json(
          { status: "error", message: `Dish with ID ${item.dishId} not found` },
          { status: 404 }
        );
      }

      const itemPrice = dish.price || 0;
      const subtotal = itemPrice * item.quantity;
      totalPrice += subtotal;

      resolvedItems.push({
        dishId: dish.id,
        dishName: dish.name,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 2. Create Order & OrderItems inside a transaction
    const order = await prisma.order.create({
      data: {
        type,
        tableNumber: tableNumber || null,
        roomNumber: roomNumber || null,
        status: "PENDING",
        totalPrice,
        items: {
          create: resolvedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ status: "success", data: order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/restaurant/orders error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
