"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/auth")) return null

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-6 border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2 mr-auto">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Shield className="size-3.5" />
        </div>
        <span className="font-semibold text-sm tracking-tight">OpenCam</span>
      </Link>
      <nav className="flex items-center gap-2">
        {user ? (
          <Button asChild size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
