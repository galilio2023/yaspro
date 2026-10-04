import "server-only";
import "@/lib/deployment-environment";
import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as transactionalDrizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

// HTTP queries remain lightweight; callback transactions need a WebSocket session.
const transaction: NeonDatabase<typeof schema>["transaction"] = async (callback, config) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    return await transactionalDrizzle(pool, { schema }).transaction(callback, config);
  } finally {
    await pool.end();
  }
};

type Database = Omit<ReturnType<typeof createDb>, "transaction"> & { transaction: typeof transaction };

// Defer configuration errors until a query is attempted so actions can handle them.
let client: ReturnType<typeof createDb> | undefined;
export const db = new Proxy({} as Database, {
  get(_target, property) {
    if (property === "transaction") return transaction;
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
