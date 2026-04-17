// https://lucia-auth.com/sessions/basic

import { db } from "@/drizzle/db"
import { sessions, SessionSelect } from "@/drizzle/schema"
import { hashSecret } from "@/lib/session"
import { createHash } from "crypto"
import { eq } from "drizzle-orm"

function generateSecureRandomString(): string {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let id = ""
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i] >> 3]
  }
  return id
}

interface SessionWithToken extends SessionSelect {
  token: string
}

export async function createSession(
  userId: number
): Promise<SessionWithToken | null> {
  const id = generateSecureRandomString()
  const secret = generateSecureRandomString()
  const secretHash = hashSecret(secret)
  const token = id + "." + secret

  let res = await db
    .insert(sessions)
    .values({
      id: id,
      secretHash: secretHash,
      userId: userId,
    })
    .returning()

  if (res.length < 1) return null
  let sessionWithToken = res.at(0) as SessionWithToken

  sessionWithToken.token = token

  return sessionWithToken
}

export async function getSession(
  sessionId: string
): Promise<SessionSelect | null> {
  let res = await db.select().from(sessions).where(eq(sessions.id, sessionId))

  if (res.length < 1) return null
  let session = res.at(0)

  if (res.at(0) === undefined) return null
  return res.at(0)!
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}
