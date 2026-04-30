"use client"

import * as React from "react"
import { Video } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"

function useFeed(deviceId: string) {
  const [frameSrc, setFrameSrc] = React.useState<string | null>(null)
  const prevUrl = React.useRef<string | null>(null)

  React.useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(
      `${protocol}//${window.location.hostname}:7890?device=${deviceId}`
    )
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
  }, [deviceId])

  return frameSrc
}

export function AdminFeedCard({ deviceId }: { deviceId: string }) {
  const frameSrc = useFeed(deviceId)

  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-video items-center justify-center bg-neutral-950">
        {frameSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frameSrc}
            alt={`Feed ${deviceId}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <Video className="size-8" />
            <span className="text-xs">Waiting for signal…</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          <span
            className={`size-1.5 rounded-full ${frameSrc ? "animate-pulse bg-red-500" : "bg-neutral-500"}`}
          />
          {frameSrc ? "LIVE" : "WAITING"}
        </div>
      </div>
      <CardHeader className="px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground">{deviceId}</span>
      </CardHeader>
    </Card>
  )
}
