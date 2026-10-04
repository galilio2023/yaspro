import "server-only";

// Preview must opt in to isolated credentials; never inherit production defaults.
if (process.env.VERCEL_ENV === "preview") {
  const databaseUrl = process.env.PREVIEW_DATABASE_URL;
  const authSecret = process.env.PREVIEW_BETTER_AUTH_SECRET;
  if (!databaseUrl || !authSecret) {
    throw new Error("Preview requires PREVIEW_DATABASE_URL and PREVIEW_BETTER_AUTH_SECRET.");
  }
  if (databaseUrl === process.env.DATABASE_URL || authSecret === process.env.BETTER_AUTH_SECRET) {
    throw new Error("Preview credentials must differ from the default deployment credentials.");
  }
  process.env.DATABASE_URL = databaseUrl;
  process.env.BETTER_AUTH_SECRET = authSecret;
}
