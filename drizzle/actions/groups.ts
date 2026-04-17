import { eq, count, and } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { groups, groupMembers, houses, GroupSelect } from "@/drizzle/schema"

export async function getGroupsForUser(userId: number) {
  return db
    .select({
      id: groups.id,
      name: groups.name,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      role: groupMembers.role,
      memberCount: count(groupMembers.id),
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .groupBy(
      groups.id,
      groups.name,
      groups.createdBy,
      groups.createdAt,
      groupMembers.role
    )
}

export async function getGroupById(
  groupId: number
): Promise<GroupSelect | null> {
  const res = await db.select().from(groups).where(eq(groups.id, groupId))
  return res.at(0) ?? null
}

export async function isGroupMember(
  groupId: number,
  userId: number
): Promise<boolean> {
  const res = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    )
  return res.length > 0
}

export async function createGroupRecord(
  name: string,
  userId: number
): Promise<GroupSelect | null> {
  const res = await db
    .insert(groups)
    .values({ name, createdBy: userId })
    .returning()

  const group = res.at(0)
  if (!group) return null

  // Add creator as admin member
  await db.insert(groupMembers).values({
    groupId: group.id,
    userId,
    role: "admin",
  })

  return group
}
