"use client"

import * as React from "react"
import { fetchConnectedDevices } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { AdminFeedCard } from "@/components/admin-feed-card"

export function AdminDebugButton() {
  const [devices, setDevices] = React.useState<string[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleClick() {
    setPending(true)
    setError(null)
    const result = await fetchConnectedDevices()
    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setDevices(result.devices ?? [])
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <Button onClick={handleClick} disabled={pending} variant="outline">
        {pending ? "Fetching…" : "Fetch connected devices"}
      </Button>

      {error && (
        <p className="text-sm text-destructive">Error: {error}</p>
      )}

      {devices !== null && (
        <>
          <p className="text-sm text-muted-foreground">
            {devices.length === 0
              ? "No devices connected."
              : `${devices.length} device(s) connected.`}
          </p>
          {devices.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map((id) => (
                <AdminFeedCard key={id} deviceId={id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
