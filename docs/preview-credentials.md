# Deployment credentials

Production uses `DATABASE_URL` and `BETTER_AUTH_SECRET`, scoped to **Production** in Vercel.

Preview requires **Preview-only** `PREVIEW_DATABASE_URL` and `PREVIEW_BETTER_AUTH_SECRET`.
The server deployment configuration selects these as the effective database URL and
Better Auth secret before either client is initialized. Missing values or values
identical to inherited defaults stop the preview. Do not also set the default
variables to the same preview values.

Provision a separate Neon database/branch containing only synthetic users and
sessions (do not clone production authentication records). Generate an independent
random auth secret of at least 32 characters. Restrict the database credential to
that preview database. Set `NEXT_PUBLIC_APP_URL` to the preview origin. Rebuild and
redeploy previews after setting these variables; existing deployments retain their
old configuration. Verify a production session is rejected by the preview.

These repository safeguards cannot prove remote databases are isolated. The Vercel
and Neon owners must verify the scopes and database contents before enabling previews.

# Handover credentials

Distribute only regenerated guides containing the secure-channel notice. Withdraw
older PDF copies. If the formerly printed shared password remains active, rotate
it independently for every affected account and revoke existing sessions. Deliver
new credentials through the approved secure channel, never through this repository.
