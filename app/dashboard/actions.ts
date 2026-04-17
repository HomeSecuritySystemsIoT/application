"use server"

import { revalidatePath } from "next/cache"
import { getCurrentSession } from "@/lib/session"
import { createGroupRecord } from "@/drizzle/actions/groups"
import { createHouseRecord } from "@/drizzle/actions/houses"
import { createRoomRecord } from "@/drizzle/actions/rooms"
import {
  setCameraActive,
  setCameraMotionDetection,
} from "@/drizzle/actions/cameras"

// ── Group ─────────────────────────────────────────────────────────────────────

export type CreateState = { error?: string; success?: boolean } | null

export async function createGroup(
  prevState: CreateState,
  formData: FormData
): Promise<CreateState> {
  const { user } = await getCurrentSession()
  if (!user) return { error: "Not authenticated." }

  const name = (formData.get("name") as string)?.trim()
  if (!name) return { error: "Name is required." }

  const group = await createGroupRecord(name, user.id)
  if (!group) return { error: "Failed to create group." }

  revalidatePath("/dashboard")
  return { success: true }
}

// ── House ─────────────────────────────────────────────────────────────────────

export async function createHouse(
  prevState: CreateState,
  formData: FormData
): Promise<CreateState> {
  const { user } = await getCurrentSession()
  if (!user) return { error: "Not authenticated." }

  const groupId = Number(formData.get("groupId"))
  const name = (formData.get("name") as string)?.trim()
  const address = (formData.get("address") as string)?.trim()

  if (!name) return { error: "Name is required." }

  const house = await createHouseRecord(groupId, name, address || undefined)
  if (!house) return { error: "Failed to create house." }

  revalidatePath(`/dashboard/${groupId}`)
  return { success: true }
}

// ── Room ──────────────────────────────────────────────────────────────────────

export async function createRoom(
  prevState: CreateState,
  formData: FormData
): Promise<CreateState> {
  const { user } = await getCurrentSession()
  if (!user) return { error: "Not authenticated." }

  const houseId = Number(formData.get("houseId"))
  const groupId = Number(formData.get("groupId"))
  const name = (formData.get("name") as string)?.trim()

  if (!name) return { error: "Name is required." }

  const room = await createRoomRecord(houseId, name)
  if (!room) return { error: "Failed to create room." }

  revalidatePath(`/dashboard/${groupId}/${houseId}`)
  return { success: true }
}

// ── Camera toggles ────────────────────────────────────────────────────────────

export async function toggleCameraActive(
  cameraId: number,
  isActive: boolean,
  path: string
): Promise<void> {
  await setCameraActive(cameraId, isActive)
  revalidatePath(path)
}

export async function toggleCameraMotionDetection(
  cameraId: number,
  motionDetection: boolean,
  path: string
): Promise<void> {
  await setCameraMotionDetection(cameraId, motionDetection)
  revalidatePath(path)
}
