import { eq, count } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { rooms, cameras, RoomSelect } from "@/drizzle/schema"

export async function getRoomsWithCameraCount(houseId: number) {
  return db
    .select({
      id: rooms.id,
      name: rooms.name,
      houseId: rooms.houseId,
      createdAt: rooms.createdAt,
      cameraCount: count(cameras.id),
    })
    .from(rooms)
    .leftJoin(cameras, eq(cameras.roomId, rooms.id))
    .where(eq(rooms.houseId, houseId))
    .groupBy(rooms.id, rooms.name, rooms.houseId, rooms.createdAt)
}

export async function getRoomById(roomId: number): Promise<RoomSelect | null> {
  const res = await db.select().from(rooms).where(eq(rooms.id, roomId))
  return res.at(0) ?? null
}

export async function createRoomRecord(
  houseId: number,
  name: string
): Promise<RoomSelect | null> {
  const res = await db.insert(rooms).values({ houseId, name }).returning()
  return res.at(0) ?? null
}
