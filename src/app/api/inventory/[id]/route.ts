import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/inventory/[id] - Update inventory item quantity/details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, name, category, minThreshold } = body;

    const itemExists = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!itemExists) {
      return NextResponse.json(
        { status: "error", message: "Inventory item not found" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (quantity !== undefined) data.quantity = parseFloat(quantity);
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (minThreshold !== undefined) data.minThreshold = parseFloat(minThreshold);

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ status: "success", data: updatedItem });
  } catch (error: any) {
    console.error("PATCH /api/inventory/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const itemExists = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!itemExists) {
      return NextResponse.json(
        { status: "error", message: "Inventory item not found" },
        { status: 404 }
      );
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json({ status: "success", message: "Inventory item deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/inventory/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}
