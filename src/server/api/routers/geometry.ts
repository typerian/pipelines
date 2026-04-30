import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { infrastructure } from "~/server/db/schema";

export const infrastructureRouter = createTRPCRouter({
  // PROCEDIMIENTO PARA CREAR
  create: publicProcedure
    .input(
      z.object({
        id: z.string(), // El ID que usaremos en la DB
        mapboxId: z.string(),
        geometryType: z.enum(["Point", "LineString"]),
        coordinates: z.any(), // GeoJSON coordinates
        properties: z.record(z.any()), // Los datos del modal (tipo, ramal, etc.)
        ramal: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(infrastructure).values({
        id: input.id,
        mapboxId: input.mapboxId,
        geometryType: input.geometryType,
        coordinates: input.coordinates,
        properties: input.properties,
        ramal: input.ramal,
      });
    }),

  // PROCEDIMIENTO PARA OBTENER TODO (Para cargar el mapa al inicio)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.infrastructure.findMany();
  }),
  delete: publicProcedure
    .input(z.object({ mapboxId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(infrastructure)
        .where(eq(infrastructure.mapboxId, input.mapboxId));
    }),

  // OPCIONAL: Eliminar múltiples (útil si seleccionas varias líneas)
  deleteMany: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(infrastructure)
        .where(inArray(infrastructure.mapboxId, input.ids));
    }),
});
