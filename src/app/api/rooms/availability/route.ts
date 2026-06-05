import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/availability - Retrieve lodging availability statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    const checkInDate = checkInParam ? new Date(checkInParam) : new Date();
    const checkOutDate = checkOutParam ? new Date(checkOutParam) : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);

    // 1. Get all room types
    const roomTypes = await prisma.roomType.findMany({
      orderBy: { price: "asc" },
    });

    // 2. Find all rooms
    const rooms = await prisma.room.findMany();

    // 3. Find conflicting reservations in that range
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        NOT: {
          OR: [
            { checkOut: { lte: checkInDate } },
            { checkIn: { gte: checkOutDate } },
          ],
        },
      },
      select: {
        roomId: true,
      },
    });

    const bookedRoomIds = conflictingReservations.map((r) => r.roomId);

    // 4. Compile statistics per Room Type
    const availabilityData = roomTypes.map((type) => {
      const typeRooms = rooms.filter((r) => r.roomTypeId === type.id);
      const totalRooms = typeRooms.length;

      // Unavailability filter: either booked or (if checking today) in maintenance/occupied status
      const availableRoomsList = typeRooms.filter((room) => {
        const isBooked = bookedRoomIds.includes(room.id);
        const isMaintenance = room.status === "MAINTENANCE";
        // If query range starts today, also respect actual database status
        const isToday = checkInDate.toDateString() === new Date().toDateString();
        if (isToday) {
          return !isBooked && !isMaintenance && room.status !== "OCCUPIED";
        }
        return !isBooked;
      });

      return {
        id: type.id,
        name: type.name,
        price: type.price,
        capacity: type.capacity,
        image: type.image,
        totalRooms,
        availableCount: availableRoomsList.length,
        isAvailable: availableRoomsList.length > 0,
      };
    });

    // 5. Get current overall stats for the dashboard counters
    const currentStatusCounts = {
      total: rooms.length,
      available: rooms.filter((r) => r.status === "AVAILABLE").length,
      occupied: rooms.filter((r) => r.status === "OCCUPIED").length,
      cleaning: rooms.filter((r) => r.status === "CLEANING").length,
      maintenance: rooms.filter((r) => r.status === "MAINTENANCE").length,
    };

    return NextResponse.json({
      status: "success",
      data: {
        availability: availabilityData,
        overall: currentStatusCounts,
        period: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/rooms/availability error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch availability status" },
      { status: 500 }
    );
  }
}
