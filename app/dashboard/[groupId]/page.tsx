import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Building2, ChevronRight, MapPin } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import { getGroupById, isGroupMember } from "@/drizzle/actions/groups"
import { AccessDenied } from "@/components/access-denied"
import { getHousesByGroupId } from "@/drizzle/actions/houses"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { CreateDialog } from "@/components/create-dialog"
import { createHouse } from "@/app/dashboard/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { user } = await getCurrentSession()
  if (!user) redirect("/auth/login")

  const { groupId: groupIdStr } = await params
  const groupId = Number(groupIdStr)
  if (isNaN(groupId)) notFound()

  const [group, member] = await Promise.all([
    getGroupById(groupId),
    isGroupMember(groupId, user.id),
  ])

  if (!group) notFound()
  if (!member) return <AccessDenied />

  const houses = await getHousesByGroupId(groupId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <DashboardBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: group.name },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            {houses.length} {houses.length === 1 ? "house" : "houses"}
          </p>
        </div>
        <CreateDialog
          title="Add a house"
          description="Add a house to this group to start organising rooms and cameras."
          action={createHouse}
          hiddenFields={{ groupId }}
          triggerLabel="Add house"
          submitLabel="Add house"
          extraFields={
            <Field>
              <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
              <Input id="address" name="address" placeholder="123 Main St" />
            </Field>
          }
        />
      </div>

      {houses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
            <Building2 className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No houses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a house to this group to start setting up rooms and cameras.
            </p>
          </div>
          <CreateDialog
            title="Add a house"
            description="Add a house to this group to start organising rooms and cameras."
            action={createHouse}
            hiddenFields={{ groupId }}
            triggerLabel="Add your first house"
            submitLabel="Add house"
            extraFields={
              <Field>
                <FieldLabel htmlFor="address">Address (optional)</FieldLabel>
                <Input id="address" name="address" placeholder="123 Main St" />
              </Field>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => (
            <Link key={house.id} href={`/dashboard/${groupId}/${house.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                      <Building2 className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium leading-none">{house.name}</p>
                      {house.address ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {house.address}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {house.roomCount}{" "}
                          {house.roomCount === 1 ? "room" : "rooms"}
                        </p>
                      )}
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
