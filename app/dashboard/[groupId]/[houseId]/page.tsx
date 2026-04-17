import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DoorOpen, Camera, ChevronRight } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import { getGroupById, isGroupMember } from "@/drizzle/actions/groups"
import { AccessDenied } from "@/components/access-denied"
import { getHouseById } from "@/drizzle/actions/houses"
import { getRoomsWithCameraCount } from "@/drizzle/actions/rooms"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { CreateDialog } from "@/components/create-dialog"
import { createRoom } from "@/app/dashboard/actions"
import { Card, CardContent } from "@/components/ui/card"

export default async function HousePage({
  params,
}: {
  params: Promise<{ groupId: string; houseId: string }>
}) {
  const { user } = await getCurrentSession()
  if (!user) redirect("/auth/login")

  const { groupId: groupIdStr, houseId: houseIdStr } = await params
  const groupId = Number(groupIdStr)
  const houseId = Number(houseIdStr)
  if (isNaN(groupId) || isNaN(houseId)) notFound()

  const [group, house, member, rooms] = await Promise.all([
    getGroupById(groupId),
    getHouseById(houseId),
    isGroupMember(groupId, user.id),
    getRoomsWithCameraCount(houseId),
  ])

  if (!group || !house) notFound()
  // Verify membership and that the house actually belongs to this group
  if (!member || house.groupId !== groupId) return <AccessDenied />

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <DashboardBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: group.name, href: `/dashboard/${groupId}` },
          { label: house.name },
        ]}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{house.name}</h1>
          <p className="text-sm text-muted-foreground">
            {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
          </p>
        </div>
        <CreateDialog
          title="Add a room"
          description="Add a room to start assigning cameras to it."
          action={createRoom}
          hiddenFields={{ houseId, groupId }}
          triggerLabel="Add room"
          submitLabel="Add room"
        />
      </div>

      {rooms.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
            <DoorOpen className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No rooms yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add rooms to this house to assign cameras to them.
            </p>
          </div>
          <CreateDialog
            title="Add a room"
            description="Add a room to start assigning cameras to it."
            action={createRoom}
            hiddenFields={{ houseId, groupId }}
            triggerLabel="Add your first room"
            submitLabel="Add room"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/dashboard/${groupId}/${houseId}/${room.id}`}
            >
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                      <DoorOpen className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium leading-none">{room.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Camera className="size-3" />
                        {room.cameraCount}{" "}
                        {room.cameraCount === 1 ? "camera" : "cameras"}
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
