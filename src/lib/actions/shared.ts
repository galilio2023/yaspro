
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const uuidSchema = z.string().uuid();

export function isUuid(id?: string): boolean {
  if (!id) return false;
  return uuidSchema.safeParse(id).success;
}

export function isDbAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx"));
}

export async function requireAdmin() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || (session.user as { role?: string })?.role !== "admin") {
      throw new Error("Unauthorized: Admin credentials required for this operation.");
    }
    return session;
  } catch (err) {
    if ((err as Error).message?.includes("Unauthorized")) {
      throw err;
    }
    throw new Error("Unauthorized: Admin credentials required for this operation.");
  }
}

export interface CmsResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}