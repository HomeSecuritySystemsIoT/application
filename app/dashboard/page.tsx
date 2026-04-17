import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Home, ChevronRight } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import { getGroupsForUser } from "@/drizzle/actions/groups"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { CreateDialog } from "@/components/create-dialog"
import { createGroup } from "@/app/dashboard/actions"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const { user } = await getCurrentSession()
  if (!user) redirect("/auth/login")

  const userGroups = await getGroupsForUser(user.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <DashboardBreadcrumb items={[{ label: "Dashboard" }]} />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your groups</h1>
          <p className="text-sm text-muted-foreground">
            Select a group to manage its houses and cameras.
          </p>
        </div>
        <CreateDialog
          title="Create a group"
          description="A group lets you manage houses and share access with other members."
          action={createGroup}
          triggerLabel="New group"
          submitLabel="Create group"
        />
      </div>

      {userGroups.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
            <Users className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">You&apos;re not part of any group yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a group to start managing your security cameras.
            </p>
          </div>
          <CreateDialog
            title="Create a group"
            description="A group lets you manage houses and share access with other members."
            action={createGroup}
            triggerLabel="Create your first group"
            submitLabel="Create group"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {userGroups.map((g) => (
            <Link key={g.id} href={`/dashboard/${g.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                      <Home className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium leading-none">{g.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">
                        {g.role}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
