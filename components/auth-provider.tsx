"use client"

import { createContext, useContext } from "react"
import type { SessionSelect, UserSelect } from "@/drizzle/schema"

type AuthUser = Omit<UserSelect, "password">
type AuthSession = Omit<SessionSelect, "secretHash">

type AuthContextValue = {
  session: AuthSession | null
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
})

export function AuthProvider({
  children,
  session,
  user,
}: {
  children: React.ReactNode
  session: AuthSession | null
  user: AuthUser | null
}) {
  return (
    <AuthContext.Provider value={{ session, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
