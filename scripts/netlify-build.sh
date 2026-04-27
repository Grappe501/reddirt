#!/usr/bin/env bash
# Netlify production build (Linux). Order: env → generate → migrate → seed (optional) → next build.
# Neon: NETLIFY_DATABASE_URL is copied to DATABASE_URL when DATABASE_URL is unset.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ] && [ -n "${NETLIFY_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$NETLIFY_DATABASE_URL"
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
