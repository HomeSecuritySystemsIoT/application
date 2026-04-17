"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { logout } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user } = useAuth()

  return (
    <div className="fixed top-10 right-10 z-50">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar size="lg" className="cursor-pointer">
              <AvatarFallback>
                {user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-fit">
            <DropdownMenuLabel className="text-muted-foreground font-normal p-2">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-2 text-destructive cursor-pointer">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild size="sm">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      )}
    </div>
  )
}
