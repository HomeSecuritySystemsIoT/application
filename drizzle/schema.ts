// schema.ts
import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 64 }).notNull(),
})

export const groups = pgTable("Group", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  createdBy: serial("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const groupMembers = pgTable(
  "GroupMember",
  {
    id: serial("id").primaryKey(),
    groupId: serial("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 16 }).notNull().default("member"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("group_member_unique_idx").on(t.groupId, t.userId),
  })
)

export const houses = pgTable("House", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  address: varchar("address", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const rooms = pgTable("Room", {
  id: serial("id").primaryKey(),
  houseId: integer("house_id")
    .notNull()
    .references(() => houses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const cameras = pgTable("Camera", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull().default("Camera"),
  deviceId: varchar("device_id", { length: 64 }),
  isActive: boolean("is_active").notNull().default(true),
  motionDetection: boolean("motion_detection").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const claimTokens = pgTable("ClaimToken", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  consumedByDeviceId: varchar("consumed_by_device_id", { length: 64 }),
  status: varchar("status", { length: 16 }).notNull().default("unused"),
})
export type ClaimTokenSelect = typeof claimTokens.$inferSelect

// auth
export const sessions = pgTable("Sessions", {
  userId: serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  id: varchar("id", { length: 24 }).primaryKey(),
  secretHash: varchar("secretHash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type SessionSelect = typeof sessions.$inferSelect
export type UserSelect = typeof users.$inferSelect
export type GroupSelect = typeof groups.$inferSelect
export type GroupMembersSelect = typeof groupMembers.$inferSelect
export type HouseSelect = typeof houses.$inferSelect
export type RoomSelect = typeof rooms.$inferSelect
export type CameraSelect = typeof cameras.$inferSelect
