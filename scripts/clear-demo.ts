import "dotenv/config"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"

const DEMO_GROUP_NAME = "Demo Home"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set in .env")
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) throw new Error("ADMIN_EMAIL is not set in .env")

  const client = postgres(url)
  const db = drizzle(client, { schema })

  const adminRows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
  if (adminRows.length === 0) {
    throw new Error(`No user found with email "${adminEmail}".`)
  }
  const admin = adminRows[0]

  const demoGroups = await db
    .select()
    .from(schema.groups)
    .where(
      and(
        eq(schema.groups.name, DEMO_GROUP_NAME),
        eq(schema.groups.createdBy, admin.id)
      )
    )

  if (demoGroups.length === 0) {
    console.log("No demo data found — nothing to clear.")
    await client.end()
    return
  }

  for (const group of demoGroups) {
    await db.delete(schema.groups).where(eq(schema.groups.id, group.id))
    console.log(
      `Deleted group "${group.name}" (id ${group.id}) and all its houses, rooms, and cameras.`
    )
  }

  await client.end()
}

main().catch((err: unknown) => {
  console.error("Clear failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
