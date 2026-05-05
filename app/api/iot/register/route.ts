export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { validateAndConsumeClaimToken } from "@/drizzle/actions/claimTokens"
import { db } from "@/drizzle/db"
import { cameras } from "@/drizzle/schema"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    )
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("device_id" in body) ||
    !("claim_token" in body)
  ) {
    return NextResponse.json(
      { error: "Missing device_id or claim_token" },
      { status: 400, headers: corsHeaders }
    )
  }

  const { device_id, claim_token } = body as Record<string, unknown>

  if (typeof device_id !== "string" || device_id.length === 0 || device_id.length > 64) {
    return NextResponse.json(
      { error: "Invalid device_id" },
      { status: 400, headers: corsHeaders }
    )
  }

  if (
    typeof claim_token !== "string" ||
    !/^[0-9a-f]{64}$/.test(claim_token)
  ) {
    return NextResponse.json(
      { error: "Invalid claim_token format" },
      { status: 400, headers: corsHeaders }
    )
  }

  const result = await validateAndConsumeClaimToken(claim_token, device_id)

  if (!result) {
    return NextResponse.json(
      { error: "Invalid or expired claim token" },
      { status: 400, headers: corsHeaders }
    )
  }

  const { roomId } = result

  await db.insert(cameras).values({
    roomId,
    name: "Camera",
    deviceId: device_id,
    isActive: true,
    motionDetection: false,
  })

  return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
}
