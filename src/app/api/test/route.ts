import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const sites = await prisma.site.findMany();
    const roomTypes = await prisma.roomType.findMany();
    
    return NextResponse.json({
      status: "success",
      message: "Prisma 7 database successfully queried from Next.js API",
      data: {
        settings,
        sites,
        roomTypes,
      }
    });
  } catch (error: any) {
    console.error("Test API Error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message || "Failed to query database",
    }, { status: 500 });
  }
}
