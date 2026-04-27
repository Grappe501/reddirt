#!/usr/bin/env bash
# Netlify production build (Linux). Order: env → generate → migrate → seed (optional) → next build.
# Neon: NETLIFY_DATABASE_URL is copied to DATABASE_URL when DATABASE_URL is unset.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ] && [ -n "${NETLIFY_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$NETLIFY_DATABASE_URL"
fi

# Netlify UI pastes sometimes add leading/trailing spaces — Prisma then fails
# P1012 ("must start with postgresql://") even though the var is "set".
if [ -n "${DATABASE_URL:-}" ]; then
  DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  export DATABASE_URL
fi

# Strip a full-line value accidentally wrapped in ASCII double quotes.
if [ "${#DATABASE_URL}" -ge 2 ] && [ "${DATABASE_URL:0:1}" = '"' ] && [ "${DATABASE_URL: -1}" = '"' ]; then
  DATABASE_URL="${DATABASE_URL:1:$((${#DATABASE_URL} - 2))}"
  export DATABASE_URL
fi

# Block accidental local Docker URLs — Netlify cannot reach your laptop.
case "${DATABASE_URL:-}" in
  *"127.0.0.1"*|*"localhost"*|*"::1"*)
    echo ""
    echo "========================================================================"
    echo "  Build failed: DATABASE_URL points to this machine (localhost)."
    echo ""
    echo "  Netlify runs in the cloud — it cannot use your local Postgres on"
    echo "  127.0.0.1. In Netlify → Environment variables, set DATABASE_URL to"
    echo "  your hosted Postgres URL (e.g. Neon). Copy it from the Neon dashboard"
    echo "  or link Neon in Netlify; do not paste .env.example / Docker values."
    echo "========================================================================"
    echo ""
    exit 1
    ;;
esac

if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "========================================================================"
  echo "  Build failed: DATABASE_URL is not set."
  echo ""
  echo "  Netlify → Site configuration → Environment variables:"
  echo "    DATABASE_URL = your Postgres URL (pooled if the provider recommends it)"
  echo ""
  echo "  If you use the Neon integration, ensure the DB is linked so"
  echo "  NETLIFY_DATABASE_URL is injected; this script maps it to DATABASE_URL."
  echo "========================================================================"
  echo ""
  exit 1
fi

case "${DATABASE_URL}" in
  postgresql://*|postgres://*) ;;
  *)
    echo ""
    echo "========================================================================"
    echo "  Build failed: DATABASE_URL must start with postgresql:// or postgres://"
    echo ""
    echo "  Common causes:"
    echo "    • Leading/trailing spaces (trimmed once; re-paste if it persists)."
    echo "    • Pasted host/user/port only — need a full URI from Supabase Connect."
    echo "    • Password contains a dollar sign — Netlify may treat it as"
    echo "      variable expansion; change the DB password or escape per Netlify docs."
    echo "    • Disconnected Neon extension but empty NETLIFY_DATABASE_URL — set"
    echo "      DATABASE_URL explicitly for production builds."
    echo "========================================================================"
    echo ""
    exit 1
    ;;
esac

echo ">>> prisma generate"
npx prisma generate

echo ">>> prisma migrate deploy"
npx prisma migrate deploy

if [ "${SKIP_DB_SEED:-}" = "1" ] || [ "${SKIP_DB_SEED:-}" = "true" ] || [ "${SKIP_DB_SEED:-}" = "yes" ]; then
  echo ">>> prisma db seed skipped (SKIP_DB_SEED is set)"
else
  echo ">>> prisma db seed (baseline data; idempotent). Set SKIP_DB_SEED=1 to skip."
  npx prisma db seed
fi

echo ">>> next build"
npm run build
