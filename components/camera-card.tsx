"use client"

import * as React from "react"
import { MoreHorizontal, Video, VideoOff, Wifi, X, Maximize2 } from "lucide-react"
import type { CameraSelect } from "@/drizzle/schema"
import {
  toggleCameraActive,
  toggleCameraMotionDetection,
} from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
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

    const backendWsUrl =
      process.env.NEXT_PUBLIC_BACKEND_WS_URL ??
      `ws://${window.location.hostname}:7890`
    const ws = new WebSocket(`${backendWsUrl}?device=${deviceId}`)
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
  const [motionDetection, setMotionDetection] = React.useState(camera.motionDetection)
  const [isPending, startTransition] = React.useTransition()
  const [zoomed, setZoomed] = React.useState(false)
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
    <>
      {/* ── Card ── */}
      <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
        {/* Feed */}
        <div
          className="relative flex aspect-video items-center justify-center bg-neutral-950 cursor-pointer overflow-hidden"
          onClick={() => setZoomed(true)}
          title="Click to expand"
        >
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
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <Video className="size-8" />
                    <span className="text-xs font-medium">No signal — waiting for device</span>
                  </div>
                </>
              )}
              {/* LIVE / WAITING badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/55 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white/90 border border-white/10">
                <span className={`size-1.5 rounded-full ${frameSrc ? "animate-pulse bg-red-500" : "bg-neutral-500"}`} />
                {frameSrc ? "LIVE" : "WAITING"}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-600">
              <VideoOff className="size-8" />
              <span className="text-xs font-medium">Feed disabled</span>
            </div>
          )}

          {/* Expand icon on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Maximize2 className="size-4 text-white" />
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
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

        {/* Info row */}
        <div className="px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold truncate">{camera.name}</span>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ml-2 flex-shrink-0 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-muted text-muted-foreground border border-border"
            }`}>
              <span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {camera.deviceId && (
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
              {camera.deviceId}
            </p>
          )}
        </div>
      </div>

      {/* ── Zoom modal ── */}
      {zoomed && (
        <div className="cam-zoom-overlay" onClick={() => setZoomed(false)}>
          <div className="cam-zoom-box" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-neutral-950">
              {isActive && frameSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frameSrc}
                  alt={`${camera.name} feed`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-600">
                  <Video className="size-10" />
                  <span className="text-sm font-medium">Waiting for device signal</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-700">
                  <VideoOff className="size-10" />
                  <span className="text-sm font-medium">Feed disabled</span>
                </div>
              )}
              {isActive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/55 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white/90 border border-white/10">
                  <span className={`size-1.5 rounded-full ${frameSrc ? "animate-pulse bg-red-500" : "bg-neutral-500"}`} />
                  {frameSrc ? "LIVE" : "WAITING"}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
              <div>
                <p className="font-semibold">{camera.name}</p>
                {camera.deviceId && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{camera.deviceId}</p>
                )}
              </div>
              <button
                onClick={() => setZoomed(false)}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
