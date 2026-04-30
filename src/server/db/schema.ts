import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const infrastructure = sqliteTable("infrastructure", {
  id: text("id").primaryKey(),
  mapboxId: text("mapbox_id").unique().notNull(),

  // SQLite no tiene timestamp nativo, guardamos como integer (ms) o text (ISO)
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),

  // En lugar de pgEnum, usamos text con validación de tipo en TS
  geometryType: text("geometry_type", {
    enum: ["Point", "LineString"],
  }).notNull(),

  // SQLite usa blob o text para JSON; Drizzle lo maneja con .json()
  coordinates: text("coordinates", { mode: "json" }).notNull(),
  properties: text("properties", { mode: "json" }).notNull(),

  ramal: text("ramal"),
});
