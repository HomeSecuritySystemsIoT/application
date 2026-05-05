"use client"

import * as React from "react"
import QRCode from "react-qr-code"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { createClaimTokenAction } from "@/app/dashboard/actions"

interface AddCameraDialogProps {
  roomId: number
  groupId: number
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function AddCameraDialog({ roomId, groupId }: AddCameraDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [token, setToken] = React.useState<string | null>(null)
  const [expiresAt, setExpiresAt] = React.useState<Date | null>(null)
  const [secondsLeft, setSecondsLeft] = React.useState<number>(600)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch token when dialog opens
  React.useEffect(() => {
    if (!open) return

    setToken(null)
    setExpiresAt(null)
    setSecondsLeft(600)
    setError(null)
    setLoading(true)

    createClaimTokenAction(groupId, roomId)
      .then(({ token: t, expiresAt: ea }) => {
        setToken(t)
        setExpiresAt(new Date(ea))
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to generate token")
      })
      .finally(() => setLoading(false))
  }, [open, groupId, roomId])

  // Countdown timer
  React.useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? ""
  const qrPayload = token
    ? btoa(JSON.stringify({ v: 1, t: token, u: frontendUrl }))
    : ""

  const expired = secondsLeft === 0

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add Camera
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Camera</DialogTitle>
            <DialogDescription>
              Scan the QR code with your phone, copy the text, and connect to the wifi network created by the device, after connecting to it's network, open a browser and go to 192.168.4.1 and complete the form.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {loading && (
              <div className="flex h-48 items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Generating token...
                </span>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {!loading && !error && token && (
              <>
                {expired ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                    <p className="font-medium">Token expired</p>
                    <p className="text-sm text-muted-foreground">
                      Close and reopen this dialog to generate a new one.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white p-3">
                    <QRCode value={qrPayload} size={180} />
                  </div>
                )}

                <div className="w-full space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Or copy this code directly:
                  </p>
                  <code className="block cursor-copy select-all break-all rounded bg-muted px-2 py-1 font-mono text-xs">
                    {qrPayload}
                  </code>
                </div>

                <p
                  className={`text-sm font-medium tabular-nums ${
                    secondsLeft < 60 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {expired
                    ? "Expired"
                    : `Expires in ${formatCountdown(secondsLeft)}`}
                </p>

                {!expired && (
                  <p className="text-center text-xs text-muted-foreground">
                    Scan with your phone camera, copy the text shown, connect
                    to the ESP32&apos;s WiFi, then paste it in the setup page.
                  </p>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
