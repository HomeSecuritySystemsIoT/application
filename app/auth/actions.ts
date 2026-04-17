"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { timingSafeEqual } from "node:crypto"
import { hashSecret } from "@/lib/session"
import { createSession, deleteSession } from "@/drizzle/actions/sessions"
import { createUser, getUserByEmail } from "@/drizzle/actions/user"

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

function verifyPassword(plain: string, hash: string): boolean {
  const plainHash = hashSecret(plain)
  if (plainHash.length !== hash.length) return false
  return timingSafeEqual(Buffer.from(plainHash, "utf-8"), Buffer.from(hash, "utf-8"))
}

export type LoginFormState = {
  values: { email: string; password: string }
  errors: { email?: string[]; password?: string[] } | null
}

export type SignupFormState = {
  values: { email: string; password: string }
  errors: { email?: string[]; password?: string[] } | null
}

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = (formData.get("email") as string) ?? ""
  const password = (formData.get("password") as string) ?? ""

  const errors: LoginFormState["errors"] = {}

  if (!email) errors.email = ["Email is required."]
  if (!password) errors.password = ["Password is required."]

  if (Object.keys(errors).length > 0) {
    return { values: { email, password: "" }, errors }
  }

  const user = await getUserByEmail(email)
  if (!user || !verifyPassword(password, user.password)) {
    return {
      values: { email, password: "" },
      errors: { password: ["Invalid email or password."] },
    }
  }

  const session = await createSession(user.id)
  if (!session) {
    return {
      values: { email, password: "" },
      errors: { password: ["Failed to create session. Please try again."] },
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("session", session.token, SESSION_COOKIE_OPTIONS)

  redirect("/")
}

export async function signup(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const email = (formData.get("email") as string) ?? ""
  const password = (formData.get("password") as string) ?? ""

  const errors: SignupFormState["errors"] = {}

  if (!email) errors.email = ["Email is required."]
  if (!password) errors.password = ["Password is required."]
  else if (password.length < 8) errors.password = ["Must be at least 8 characters."]

  if (Object.keys(errors).length > 0) {
    return { values: { email, password: "" }, errors }
  }

  const existing = await getUserByEmail(email)
  if (existing) {
    return {
      values: { email, password: "" },
      errors: { email: ["An account with this email already exists."] },
    }
  }

  const passwordHash = hashSecret(password)
  const user = await createUser(email, passwordHash)
  if (!user) {
    return {
      values: { email, password: "" },
      errors: { email: ["Failed to create account. Please try again."] },
    }
  }

  const session = await createSession(user.id)
  if (!session) {
    return {
      values: { email, password: "" },
      errors: { password: ["Failed to create session. Please try again."] },
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("session", session.token, SESSION_COOKIE_OPTIONS)

  redirect("/")
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (token) {
    const sessionId = token.split(".")[0]
    await deleteSession(sessionId)
  }

  cookieStore.delete("session")
  redirect("/auth/login")
}
