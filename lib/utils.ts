import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cookies } from "next/headers"
import { cache } from "react"
import { SessionSelect, UserSelect } from "@/drizzle/schema"
import { getSession } from "@/drizzle/actions/sessions"
import { createHash } from "crypto"
import { timingSafeEqual } from "node:crypto"
import { getUser } from "@/drizzle/actions/user"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function hexToBytes(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, "hex"))
}

function constantTimeEqual(a: string, b: string): boolean {
  const a_bytes = hexToBytes(a)
  const b_bytes = hexToBytes(b)

  if (a_bytes.length !== b_bytes.length) {
    return false
  }

  return timingSafeEqual(a_bytes, b_bytes)
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf-8").digest("hex")
}

async function validateSessionToken(
  token: string
): Promise<SessionSelect | null> {
  const tokenParts = token.split(".")
  if (tokenParts.length !== 2) {
    return null
  }
  const sessionId = tokenParts[0]
  const sessionSecret = tokenParts[1]

  const session = await getSession(sessionId)
  if (!session) {
    return null
  }

  const tokenSecretHash = hashSecret(sessionSecret)
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash)
  if (!validSecret) {
    return null
  }

  return session
}

type Session =
  | {
      session: Omit<SessionSelect, "secretHash">
      user: Omit<UserSelect, "password">
    }
  | {
      session: null
      user: null
    }

export const getCurrentSession = cache(async (): Promise<Session> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value ?? null

  if (token === null) return { session: null, user: null }

  const result = await validateSessionToken(token)
  if (result == null) {
    return { session: null, user: null }
  }

  const { secretHash, ...session } = result

  const user = await getUser(session.userId)
  if (!user) return { session: null, user: null }

  return { session, user }
})
