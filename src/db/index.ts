import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

// Defer configuration errors until a query is attempted so actions can handle them.
let client: ReturnType<typeof createDb> | undefined;
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, property) {
    client ??= createDb();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type DB = typeof db;

/**
 * Returns true if DATABASE_URL is configured and not pointing to default placeholder.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx"));
}
