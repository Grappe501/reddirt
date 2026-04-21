/**
 * Server/runtime environment — no secrets exposed to the client.
 * Use NEXT_PUBLIC_* only for values that must ship to the browser.
 */
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  /** Public site URL for OG/metadata (also in siteConfig fallback) */
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type ParsedServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ParsedServerEnv | null = null;

/** Safe parse of process.env for server code paths. */
export function getServerEnv(): ParsedServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  cached = parsed.success ? parsed.data : {};
  return cached;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local, start Postgres (docker compose up -d), then retry.",
    );
  }
  return url;
}

/** Friendly check for API routes that need the DB. */
export function databaseUnavailableResponse() {
  return {
    ok: false as const,
    error: "database_unavailable",
    message:
      "Database not configured. Set DATABASE_URL in .env.local and run npm run dev:prepare (or dev:full).",
  };
}
