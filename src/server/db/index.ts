import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cacheamos el cliente en desarrollo para evitar múltiples
 * conexiones simultáneas a Turso durante el Hot Reload.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

// Usamos TURSO_DATABASE_URL y TURSO_AUTH_TOKEN
const client =
  globalForDb.client ??
  createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
