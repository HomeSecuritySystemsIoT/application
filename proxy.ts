import { type NextRequest, NextResponse } from "next/server"
import { createHash, timingSafeEqual } from "node:crypto"
import { db } from "@/drizzle/db"
import { sessions } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in ms

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/auth/login", "/auth/signup"]

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf-8").digest("hex")
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a, "utf-8"), Buffer.from(b, "utf-8"))
}

async function validateSession(token: string): Promise<boolean> {
  const parts = token.split(".")
  if (parts.length !== 2) return false

  const [sessionId, sessionSecret] = parts

  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))

  const session = rows.at(0)
  if (!session) return false

  // Check expiry
  if (Date.now() - session.createdAt.getTime() >= SESSION_MAX_AGE_MS) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return false
  }

  // Verify secret
  const secretHash = hashSecret(sessionSecret)
  if (!constantTimeEqual(secretHash, session.secretHash)) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return false
  }

  return true
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get("session")?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  // No cookie on a protected route → redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/auth/login", req.url)
    url.searchParams.set("redirectTo", path)
    return NextResponse.redirect(url)
  }

  if (token && (isProtectedRoute || isAuthRoute)) {
    let isValid = false
    try {
      isValid = await validateSession(token)
    } catch {
      // DB unreachable — don't lock users out
      return NextResponse.next()
    }

    // Expired/invalid session on a protected route
    if (isProtectedRoute && !isValid) {
      const res = NextResponse.redirect(
        new URL(`/auth/login?redirectTo=${path}`, req.url)
      )
      res.cookies.delete("session")
      return res
    }

    // Already authenticated, redirect away from auth pages
    if (isAuthRoute && isValid) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Valid session but cookie is stale (expired in DB) — clear it
    if (!isValid) {
      const res = NextResponse.next()
      res.cookies.delete("session")
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
