import "@/lib/deployment-environment";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET && !isBuildPhase) {
  // Never fall back to a known secret at runtime: that would allow forged sessions.
  throw new Error("BETTER_AUTH_SECRET must be set in production.");
}
const secret =
  process.env.BETTER_AUTH_SECRET ||
  (isBuildPhase ? "build-phase-only-placeholder-secret-32chars" :
    process.env.NODE_ENV !== "production" ? "dev-secret-key-at-least-32-chars-long" : undefined);

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const trustedOrigins = [
  appUrl,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter((o): o is string => Boolean(o));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "client",
        input: false, // only set programmatically or via admin
      },
      phone: {
        type: "string",
        required: false,
      },
      company: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  baseURL: appUrl,
  trustedOrigins,
  secret,
});
