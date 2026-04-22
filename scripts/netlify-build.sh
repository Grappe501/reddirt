#!/usr/bin/env bash
# Netlify runs Linux; Prisma requires DATABASE_URL before `migrate deploy`.
# The Neon Netlify extension often sets NETLIFY_DATABASE_URL — map it for Prisma.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ] && [ -n "${NETLIFY_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$NETLIFY_DATABASE_URL"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "========================================================================"
  echo "  Build failed: DATABASE_URL is not set."
  echo ""
  echo "  Set it in Netlify: Site configuration → Environment variables →"
  echo "  Add variable DATABASE_URL = your Postgres connection string"
  echo "  (use a pooled/serverless URL for serverless hosts)."
  echo ""
  echo "  If you use the Neon extension, finish linking the database so"
  echo "  NETLIFY_DATABASE_URL is injected; this script maps that to"
  echo "  DATABASE_URL for Prisma."
  echo "========================================================================"
  echo ""
  exit 1
fi

npx prisma migrate deploy
npm run build
