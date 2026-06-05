import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccess } from "@/lib/auth";

// PATCH /api/hr/[id] - Update staff details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { position, salary, contractType, shift, status } = body;

    const staffExists = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staffExists) {
      return NextResponse.json(
        { status: "error", message: "Staff record not found" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (position !== undefined) data.position = position;
    if (salary !== undefined) data.salary = parseFloat(salary);
    if (contractType !== undefined) data.contractType = contractType;
    if (shift !== undefined) data.shift = shift;
    if (status !== undefined) data.status = status;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ status: "success", data: updatedStaff });
  } catch (error: any) {
    console.error("PATCH /api/hr/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update staff record" },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/[id] - Remove staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAccess(request, ["ADMIN"]);
    if (!authorized) {
      return NextResponse.json({ status: "error", message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const staffExists = await prisma.staff.findUnique({
      where: { id },
    });


    if (!staffExists) {
      return NextResponse.json(
        { status: "error", message: "Staff record not found" },
        { status: 404 }
      );
    }

    // Instead of deleting the actual record (which might break transaction FK constraints if they reference user or staff), we set status to INACTIVE.
    const deactivatedStaff = await prisma.staff.update({
      where: { id },
      data: { status: "INACTIVE" },
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

    return NextResponse.json({ status: "success", data: deactivatedStaff });
  } catch (error: any) {
    console.error("DELETE /api/hr/[id] error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete staff record" },
      { status: 500 }
    );
  }
}
