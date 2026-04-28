import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  geometries,
  type WaterInfrastructureFeature,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Esquemas de validación reutilizables
const PipeDataSchema = z.object({
  diameter: z.string(),
  hasCoating: z.boolean(),
  coatingType: z.string().optional(),
  lengthMeters: z.number(),
});

const ValveDataSchema = z.object({
  valveType: z.string(),
  valveSize: z.string(),
  depth: z.string().optional(),
});

const FeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.enum(["Point", "LineString", "Polygon"]),
    // Forzamos que coordinates sea obligatorio y no undefined
    coordinates: z.any().refine((val) => val !== undefined, {
      message: "Coordinates are required",
    }),
  }),
  properties: z.object({
    name: z.string(),
    description: z.string().optional(),
    pipeData: PipeDataSchema.optional(),
    valveData: ValveDataSchema.optional(),
  }),
});

export const geometryRouter = createTRPCRouter({
  // 1. OBTENER TODO (Lectura)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(geometries).all();
  }),

  // 2. CREACIÓN MASIVA (Sincronización inicial o importación)
  createBatch: publicProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          source: z.enum(["manual", "kml"]),
          data: FeatureSchema,
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      // Convertimos el input al tipo que la DB espera para que Drizzle no se queje
      const values = input.map((item) => ({
        ...item,
        data: item.data as any, // O 'as WaterInfrastructureFeature' si lo tienes importado
      }));

      return await ctx.db.insert(geometries).values(values).run();
    }),

  // 3. ACTUALIZAR UN TRAZO ESPECÍFICO (Edición técnica)
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        data: FeatureSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await ctx.db
        .update(geometries)
        .set({
          ...updateData,
          // Si TS sigue quejándose, forzamos el tipo aquí:
          data: updateData.data as WaterInfrastructureFeature,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(geometries.id, id))
        .run();
    }),

  // 4. ELIMINAR UN TRAZO (Mantenimiento)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(geometries)
        .where(eq(geometries.id, input.id))
        .run();
    }),
});
