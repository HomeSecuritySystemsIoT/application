import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { cameras, CameraSelect } from "@/drizzle/schema"

export async function getCamerasByRoomId(
  roomId: number
): Promise<CameraSelect[]> {
  return db.select().from(cameras).where(eq(cameras.roomId, roomId))
}

export async function setCameraActive(
  cameraId: number,
  isActive: boolean
): Promise<void> {
  await db.update(cameras).set({ isActive }).where(eq(cameras.id, cameraId))
}

export async function setCameraMotionDetection(
  cameraId: number,
  motionDetection: boolean
): Promise<void> {
  await db
    .update(cameras)
    .set({ motionDetection })
    .where(eq(cameras.id, cameraId))
}
