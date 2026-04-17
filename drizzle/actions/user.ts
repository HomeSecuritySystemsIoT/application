import { eq } from "drizzle-orm"
import { db } from "../db"
import { users, UserSelect } from "../schema"

export async function createUser(
  email: string,
  passwordHash: string
): Promise<UserSelect | null> {
  let res = await db
    .insert(users)
    .values({
      email: email,
      password: passwordHash,
    })
    .returning()

  if (res.length == 0) return null

  const user = res.at(0)
  if (user === undefined) return null

  return user
}

export async function getUserByEmail(email: string): Promise<UserSelect | null> {
  let res = await db.select().from(users).where(eq(users.email, email))

  if (res.length < 1) return null
  return res.at(0)!
}

export async function getUser(userId: number): Promise<UserSelect | null> {
  let res = await db.select().from(users).where(eq(users.id, userId))

  if (res.length < 1) {
    return null
  }

  return res.at(0)!
}
