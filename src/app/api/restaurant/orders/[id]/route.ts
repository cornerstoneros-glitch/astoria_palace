import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/restaurant/orders/[id] - Update order status (PENDING, SERVED, PAID, CANCELLED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { status: "error", message: "Missing required field: status" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { status: "error", message: "Order not found" },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    // Integrated logic: If order is PAID, automatically log to Accounting Ledger
    if (status === "PAID") {
      const description = `Encaissement ${order.type === 'BAR' ? 'Bar' : 'Restaurant'} — ${
        order.tableNumber ? `Table : ${order.tableNumber}` : `Chambre : ${order.roomNumber}`
      }`;

      await prisma.transaction.create({
        data: {
          amount: order.totalPrice,
          type: "PAYMENT",
          status: "PAID",
          description,
          category: "FNB",
        },
      });
    }

    return NextResponse.json({ status: "success", data: updatedOrder });
  } catch (error: any) {
    console.error("PATCH /api/restaurant/orders/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
