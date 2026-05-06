import Link from "next/link"
import { ChevronRight } from "lucide-react"

export type BreadcrumbEntry = { label: string; href?: string }

export function DashboardBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="size-3 opacity-40" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground/70 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
