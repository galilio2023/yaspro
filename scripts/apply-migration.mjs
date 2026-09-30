import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No DATABASE_URL found in .env.local");
    process.exit(1);
  }

  const sql = neon(dbUrl);
  console.log("Connecting to database and applying migration...");

  try {
    await sql`ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "arabic_name" text;`;
    await sql`ALTER TABLE "equipment" ADD COLUMN IF NOT EXISTS "arabic_description" text;`;
    await sql`ALTER TABLE "influencers" ADD COLUMN IF NOT EXISTS "arabic_role" text;`;
    await sql`ALTER TABLE "influencers" ADD COLUMN IF NOT EXISTS "arabic_bio" text;`;
    await sql`ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "arabic_name" text;`;
    await sql`ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "arabic_description" text;`;

    console.log("Migration executed successfully! Columns added to Neon PostgreSQL.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

main();
