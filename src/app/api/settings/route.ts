import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/settings - Get all system settings
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array to a key-value object for convenience
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return NextResponse.json({ status: "success", data: settingsMap });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update settings in bulk
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json(); // Expected: { [key: string]: string }
    
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { status: "error", message: "Invalid settings payload. Expected an object." },
        { status: 400 }
      );
    }

    const updatePromises = Object.entries(body).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updatePromises);

    const updatedSettings = await prisma.systemSetting.findMany();
    const settingsMap = updatedSettings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    return NextResponse.json({ status: "success", data: settingsMap });
  } catch (error: any) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
