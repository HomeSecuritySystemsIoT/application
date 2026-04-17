import { eq, count } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { houses, rooms, HouseSelect } from "@/drizzle/schema"

export async function getHousesByGroupId(groupId: number) {
  return db
    .select({
      id: houses.id,
      name: houses.name,
      address: houses.address,
      groupId: houses.groupId,
      createdAt: houses.createdAt,
      roomCount: count(rooms.id),
    })
    .from(houses)
    .leftJoin(rooms, eq(rooms.houseId, houses.id))
    .where(eq(houses.groupId, groupId))
    .groupBy(
      houses.id,
      houses.name,
      houses.address,
      houses.groupId,
      houses.createdAt
    )
}

export async function getHouseById(
  houseId: number
): Promise<HouseSelect | null> {
  const res = await db.select().from(houses).where(eq(houses.id, houseId))
  return res.at(0) ?? null
}

export async function createHouseRecord(
  groupId: number,
  name: string,
  address?: string
): Promise<HouseSelect | null> {
  const res = await db
    .insert(houses)
    .values({ groupId, name, address: address || null })
    .returning()
  return res.at(0) ?? null
}
