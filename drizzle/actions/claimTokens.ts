import crypto from "crypto"
import { and, eq, gt, sql } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { claimTokens } from "@/drizzle/schema"

export async function createClaimToken(
  groupId: number,
  roomId: number,
  userId: number
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db.insert(claimTokens).values({
    token,
    groupId,
    roomId,
    createdByUserId: userId,
    expiresAt,
    status: "unused",
  })

  return token
}

export async function validateAndConsumeClaimToken(
  token: string,
  deviceId: string
): Promise<{ groupId: number; roomId: number } | null> {
  const now = new Date()

  const rows = await db
    .select()
    .from(claimTokens)
    .where(
      and(
        eq(claimTokens.token, token),
        eq(claimTokens.status, "unused"),
        gt(claimTokens.expiresAt, now)
      )
    )
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]

  await db
    .update(claimTokens)
    .set({
      status: "consumed",
      consumedAt: sql`now()`,
      consumedByDeviceId: deviceId,
    })
    .where(eq(claimTokens.id, row.id))

  return { groupId: row.groupId, roomId: row.roomId }
}
