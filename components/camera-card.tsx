"use client"

import * as React from "react"
import { MoreHorizontal, Video, VideoOff, Wifi } from "lucide-react"
import type { CameraSelect } from "@/drizzle/schema"
import {
  toggleCameraActive,
  toggleCameraMotionDetection,
} from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function useCameraFeed(deviceId: string | null, active: boolean) {
  const [frameSrc, setFrameSrc] = React.useState<string | null>(null)
  const prevUrl = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!deviceId || !active) return

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(`${protocol}//${window.location.hostname}:7890?device=${deviceId}`)
    ws.binaryType = "arraybuffer"

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" })
      const url = URL.createObjectURL(blob)
      setFrameSrc(url)
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current)
      prevUrl.current = url
    }

    ws.onclose = () => setFrameSrc(null)

    return () => {
      ws.close()
      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current)
    }
  }, [deviceId, active])

  return frameSrc
}

export function CameraCard({
  camera,
  path,
}: {
  camera: CameraSelect
  path: string
}) {
  const [isActive, setIsActive] = React.useState(camera.isActive)
  const [motionDetection, setMotionDetection] = React.useState(
    camera.motionDetection
  )
  const [isPending, startTransition] = React.useTransition()
  const frameSrc = useCameraFeed(camera.deviceId ?? null, isActive)

  function handleActiveChange(checked: boolean) {
    setIsActive(checked)
    startTransition(async () => {
      await toggleCameraActive(camera.id, checked, path)
    })
  }

  function handleMotionChange(checked: boolean) {
    setMotionDetection(checked)
    startTransition(async () => {
      await toggleCameraMotionDetection(camera.id, checked, path)
    })
  }

  return (
    <Card className="overflow-hidden">
      {/* Feed area */}
      <div className="relative flex aspect-video items-center justify-center bg-neutral-950">
        {isActive ? (
          <>
            {frameSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={frameSrc}
                alt={`${camera.name} feed`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
                  }}
                />
                <div className="flex flex-col items-center gap-2 text-neutral-500">
                  <Video className="size-8" />
                  <span className="text-xs">No signal — waiting for device</span>
                </div>
              </>
            )}
            {/* LIVE badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              <span className={`size-1.5 rounded-full ${frameSrc ? "animate-pulse bg-red-500" : "bg-neutral-500"}`} />
              {frameSrc ? "LIVE" : "WAITING"}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-600">
            <VideoOff className="size-8" />
            <span className="text-xs">Feed disabled</span>
          </div>
        )}

        {/* Three-dot menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-black/40 text-white hover:bg-black/60 hover:text-white"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Camera settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="size-3.5 text-muted-foreground" />
                  Feed active
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleActiveChange}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="size-3.5 text-muted-foreground" />
                  Motion detection
                </div>
                <Switch
                  checked={motionDetection}
                  onCheckedChange={handleMotionChange}
                  disabled={isPending}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{camera.name}</span>
          <span
            className={`flex items-center gap-1 text-xs ${
              isActive ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-muted-foreground"}`}
            />
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {camera.deviceId && (
          <p className="text-xs text-muted-foreground">ID: {camera.deviceId}</p>
        )}
      </CardHeader>
    </Card>
  )
}
