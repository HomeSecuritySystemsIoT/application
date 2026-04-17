// schema.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 64 }),
  password: varchar("password", { length: 64 }),
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

// auth
export const sessions = pgTable("Sessions", {
  userId: serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  id: varchar("id", { length: 24 }).primaryKey(),
  secretHash: varchar("secretHash", { length: 32 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type SessionSelect = typeof sessions.$inferSelect
export type UserSelect = typeof users.$inferSelect
export type GroupSelect = typeof groups.$inferSelect
export type GroupMembersSelect = typeof groupMembers.$inferSelect
