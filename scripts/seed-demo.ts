import "dotenv/config"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "@/drizzle/schema"
import { eq } from "drizzle-orm"

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
    throw new Error(
      `No user found with email "${adminEmail}". Sign up first, then run this script.`
    )
  }
  const admin = adminRows[0]

  // Group (creator + member in one go, mirroring createGroupRecord)
  const [group] = await db
    .insert(schema.groups)
    .values({ name: DEMO_GROUP_NAME, createdBy: admin.id })
    .returning()

  await db.insert(schema.groupMembers).values({
    groupId: group.id,
    userId: admin.id,
    role: "admin",
  })

  // House
  const [house] = await db
    .insert(schema.houses)
    .values({ groupId: group.id, name: "Main House", address: "42 Demo Street" })
    .returning()

  // 4 rooms
  const roomNames = ["Living Room", "Front Door", "Garage", "Backyard"]
  const createdRooms: (typeof schema.rooms.$inferSelect)[] = []
  for (const name of roomNames) {
    const [room] = await db
      .insert(schema.rooms)
      .values({ houseId: house.id, name })
      .returning()
    createdRooms.push(room)
  }

  // 6 cameras spread across the 4 rooms
  const cameraDefs = [
    { name: "Living Room — East", room: 0, isActive: true,  motionDetection: true  },
    { name: "Living Room — West", room: 0, isActive: true,  motionDetection: false },
    { name: "Front Door — Main",  room: 1, isActive: true,  motionDetection: true  },
    { name: "Front Door — Side",  room: 1, isActive: false, motionDetection: false },
    { name: "Garage",             room: 2, isActive: true,  motionDetection: false },
    { name: "Backyard",           room: 3, isActive: true,  motionDetection: true  },
  ]
  for (const c of cameraDefs) {
    await db.insert(schema.cameras).values({
      roomId: createdRooms[c.room].id,
      name: c.name,
      isActive: c.isActive,
      motionDetection: c.motionDetection,
    })
  }

  await client.end()

  console.log(`Demo data seeded for ${adminEmail}:`)
  console.log(`  Group:   "${DEMO_GROUP_NAME}" (id ${group.id})`)
  console.log(`  House:   ${house.name}`)
  console.log(`  Rooms:   ${roomNames.join(", ")}`)
  console.log(`  Cameras: ${cameraDefs.length} fake cameras (no device ID)`)
  console.log(`\nOpen /dashboard to see the data.`)
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
