import { redirect, notFound } from "next/navigation"
import { Video } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import { getGroupById, isGroupMember } from "@/drizzle/actions/groups"
import { AccessDenied } from "@/components/access-denied"
import { getHouseById } from "@/drizzle/actions/houses"
import { getRoomById } from "@/drizzle/actions/rooms"
import { getCamerasByRoomId } from "@/drizzle/actions/cameras"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { CameraCard } from "@/components/camera-card"
import { AddCameraDialog } from "@/components/add-camera-dialog"

export default async function RoomPage({
  params,
}: {
  params: Promise<{ groupId: string; houseId: string; roomId: string }>
}) {
  const { user } = await getCurrentSession()
  if (!user) redirect("/auth/login")

  const {
    groupId: groupIdStr,
    houseId: houseIdStr,
    roomId: roomIdStr,
  } = await params
  const groupId = Number(groupIdStr)
  const houseId = Number(houseIdStr)
  const roomId = Number(roomIdStr)
  if (isNaN(groupId) || isNaN(houseId) || isNaN(roomId)) notFound()

  const [group, house, room, member, cameras] = await Promise.all([
    getGroupById(groupId),
    getHouseById(houseId),
    getRoomById(roomId),
    isGroupMember(groupId, user.id),
    getCamerasByRoomId(roomId),
  ])

  if (!group || !house || !room) notFound()
  // Verify membership, house→group, and room→house relationships
  if (!member || house.groupId !== groupId || room.houseId !== houseId)
    return <AccessDenied />

  const path = `/dashboard/${groupId}/${houseId}/${roomId}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <DashboardBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: group.name, href: `/dashboard/${groupId}` },
          { label: house.name, href: `/dashboard/${groupId}/${houseId}` },
          { label: room.name },
        ]}
      />

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
          <p className="text-sm text-muted-foreground">
            {cameras.length} {cameras.length === 1 ? "camera" : "cameras"}{" "}
            connected
          </p>
        </div>
        <AddCameraDialog roomId={roomId} groupId={groupId} />
      </div>

      {cameras.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
            <Video className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No cameras set up</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Flash an ESP32-CAM with our firmware and it will appear here
              automatically once it connects to your account.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} path={path} />
          ))}
        </div>
      )}
    </div>
  )
}
