import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
        <ShieldX className="size-7 text-destructive" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You don&apos;t have permission to view this page.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
