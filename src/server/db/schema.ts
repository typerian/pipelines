import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

// 1. DEFINICIÓN TÉCNICA DE ATRIBUTOS
export type PipeAttributes = {
  diameter: string; // Diámetro en pulgadas (ej: "2", "4")
  hasCoating: boolean; // ¿Tiene revestimiento?
  coatingType?: string; // Tipo de revestimiento (ej: "Epóxico", "Galvanizado")
  lengthMeters: number; // Longitud calculada automáticamente
};

export type ValveAttributes = {
  valveType: string; // Tipo (ej: "Compuerta", "Mariposa", "Bola")
  valveSize: string; // Tamaño en pulgadas
  depth?: string; // Profundidad de la tanquilla
};

// 2. GEOJSON TIPADO PARA INFRAESTRUCTURA
export type WaterInfrastructureFeature = {
  id?: string | number;
  type: "Feature";
  geometry: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: any;
  };
  properties: {
    name: string; // Etiqueta general
    description?: string;
    // Campos específicos para tuberías
    pipeData?: PipeAttributes;
    // Campos específicos para tanquillas
    valveData?: ValveAttributes;
    // Metadata
    updatedAt?: string;
  };
};

export const geometries = sqliteTable("geometries", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Nombre para identificar rápido en la barra de búsqueda (ej: "Tramo Principal A")
  name: text("name").notNull(),

  // Categoría: 'LineString' (Tubería) o 'Point' (Tanquilla)
  type: text("type").notNull(),

  /**
   * Almacenamos todo el objeto WaterInfrastructureFeature.
   * Drizzle se encargará de JSON.stringify() al guardar y JSON.parse() al leer.
   */
  data: text("data", { mode: "json" })
    .$type<WaterInfrastructureFeature>()
    .notNull(),

  source: text("source").$type<"manual" | "kml">().notNull().default("manual"),

  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),

  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});
