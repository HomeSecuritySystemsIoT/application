export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { cameras } from "@/drizzle/schema"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const secret = req.headers.get("x-backend-secret")
  if (!secret || secret !== process.env.BACKEND_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { deviceId } = await params

  const rows = await db
    .select()
    .from(cameras)
    .where(and(eq(cameras.deviceId, deviceId), eq(cameras.isActive, true)))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ active: false }, { status: 404 })
  }

  return NextResponse.json({ active: true, deviceId }, { status: 200 })
}
