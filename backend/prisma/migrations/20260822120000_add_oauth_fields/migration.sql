-- AlterTable: make password_hash nullable and add OAuth columns
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_provider" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_id" TEXT;

-- Add unique constraint on (oauth_provider, oauth_id)
-- Only non-null pairs should be unique — the partial index handles NULLs correctly
CREATE UNIQUE INDEX IF NOT EXISTS "users_oauth_provider_id_key"
  ON "users" ("oauth_provider", "oauth_id")
  WHERE "oauth_provider" IS NOT NULL AND "oauth_id" IS NOT NULL;

-- Add share_slug to trips if it doesn't exist (drift from earlier session)
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "share_slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "trips_share_slug_key" ON "trips" ("share_slug") WHERE "share_slug" IS NOT NULL;

-- Add is_admin and language to users if missing (drift from earlier session)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
