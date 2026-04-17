// proxy.ts
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { sessions } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

const SESSION_COOKIE_NAME = "report-map-session-id"

const protectedRoutes = ["/dashboard", "/protected", "/report/create/"]
const authRoutes = ["/auth"]

const MAX_TIME_SESSION = 60 * 60 * 24 * 30 // 30 days

// Routes that should NEVER be intercepted (your API + static stuff)
const ignoredRoutes = ["/auth/login"]

async function validateSession(sessionId: string): Promise<boolean> {
  const res = await db
    .select({ createdAt: sessions.createdAt })
    .from(sessions)
    .where(eq(sessions.id, sessionId))

  if (res.length === 0) return false

  const createdAt =
    res[0].createdAt instanceof Date
      ? res[0].createdAt.getTime()
      : Number(res[0].createdAt)

  return Date.now() - createdAt >= MAX_TIME_SESSION
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Never touch the auth API route
  if (ignoredRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next()
  }

  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isAuthRoute = authRoutes.includes(path) || path === "/auth"

  if (isProtectedRoute && !sessionId) {
    const url = new URL("/auth", req.url)
    url.searchParams.set("redirectTo", path) // ← guarda la ruta original
    return NextResponse.redirect(url)
  }

  if (sessionId && (isProtectedRoute || isAuthRoute)) {
    const isValid = await validateSession(sessionId)

    if (isProtectedRoute && !isValid) {
      const url = new URL("/auth", req.url)
      url.searchParams.set("redirectTo", path)
      return NextResponse.redirect(url)
    }

    if (isAuthRoute && isValid) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
