import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr - Retrieve all staff details
export async function GET(request: NextRequest) {
  try {
    const staff = await prisma.staff.findMany({
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
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json({ status: "success", data: staff });
  } catch (error: any) {
    console.error("GET /api/hr error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST /api/hr - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, position, salary, contractType, shift, siteId } = body;

    if (!email || !name || !position || !siteId) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: name, email, position, siteId" },
        { status: 400 }
      );
    }

    // 1. Create or Find User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: "password123", // default temp password
          role: "STAFF",
        },
      });
    }

    // Check if staff profile already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { userId: user.id },
    });

    if (existingStaff) {
      return NextResponse.json(
        { status: "error", message: "Staff profile already exists for this user" },
        { status: 400 }
      );
    }

    // 2. Create Staff profile
    const newStaff = await prisma.staff.create({
      data: {
        userId: user.id,
        siteId,
        position,
        salary: salary ? parseFloat(salary) : 150000,
        contractType: contractType || "CDI",
        shift: shift || "Matin (06h - 14h)",
        status: "ACTIVE",
      },
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

    return NextResponse.json({ status: "success", data: newStaff }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/hr error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create staff profile" },
      { status: 500 }
    );
  }
}
