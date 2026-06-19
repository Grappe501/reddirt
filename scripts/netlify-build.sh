#!/usr/bin/env bash
# Netlify production build (Linux). Order: env → generate → migrate → seed (optional) → next build.
# Neon: NETLIFY_DATABASE_URL is copied to DATABASE_URL when DATABASE_URL is unset.

set -euo pipefail

if [ ! -f "package.json" ] || [ ! -f "netlify.toml" ]; then
  echo ""
  echo "========================================================================"
  echo "  Build failed: run from the RedDirt app root (contains netlify.toml)."
  echo "  Current directory: $(pwd)"
  echo ""
  echo "  In Netlify UI → Build & deploy → set Base directory to: RedDirt"
  echo "  Leave Publish directory empty so @netlify/plugin-nextjs uses RedDirt/.next"
  echo "========================================================================"
  echo ""
  exit 1
fi

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
# Must guard: with `set -u`, an unset DATABASE_URL would error on ${#DATABASE_URL} before the empty check below.
if [ -n "${DATABASE_URL:-}" ]; then
  if [ "${#DATABASE_URL}" -ge 2 ] && [ "${DATABASE_URL:0:1}" = '"' ] && [ "${DATABASE_URL: -1}" = '"' ]; then
    DATABASE_URL="${DATABASE_URL:1:$((${#DATABASE_URL} - 2))}"
    export DATABASE_URL
  fi
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

# Prisma `schema.prisma` uses `directUrl = env("DIRECT_URL")`. When the host uses a single URI (Neon, session pooler only), omit DIRECT_URL in Netlify and we mirror here.
if [ -z "${DIRECT_URL:-}" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi
if [ -n "${DIRECT_URL:-}" ]; then
  DIRECT_URL="$(printf '%s' "$DIRECT_URL" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  export DIRECT_URL
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

# Supabase session pooler (Supavisor) expects user postgres.<project-ref>, not plain "postgres".
if [[ "${DATABASE_URL}" == *"pooler.supabase.com"* ]]; then
  uinfo="${DATABASE_URL#*://}"
  uinfo="${uinfo%%@*}"
  db_user="${uinfo%%:*}"
  if [ "${db_user}" = "postgres" ]; then
    echo ""
    echo "========================================================================"
    echo "  Build failed: Supabase session pooler URL uses user \"postgres\" only."
    echo ""
    echo "  Prisma/Postgres P1000 often means: wrong pooler *username* (not the password)."
    echo "  In Supabase → Connect → Session pooler, the user must look like:"
    echo "    postgres.yourProjectRef   (not just postgres)"
    echo "  Paste the full URI from that screen into Netlify DATABASE_URL."
    echo "  Reset the DB password in Supabase if the password was exposed or mangled"
    echo "  (e.g. \$ in a password in Netlify env can break the string)."
    echo "========================================================================"
    echo ""
    exit 1
  fi
fi

echo ">>> prisma generate"
npx prisma generate
# Drop stale query engines (Netlify trace was pulling openssl-1.0.x + 3.0.x ~34MB).
rm -f node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node 2>/dev/null || true

# Prisma P3009: if a migration failed once, `_prisma_migrations` keeps it as failed and
# `migrate deploy` will not apply anything until it is cleared.
#
# One-time recovery (after fixing the migration SQL in git): in Netlify → Environment variables set:
#   PRISMA_RESOLVE_ROLLED_BACK=20260516143000_communication_intelligence_ingest
# Trigger a deploy; when green, **remove** that variable so future failures are not hidden.
if [ -n "${PRISMA_RESOLVE_ROLLED_BACK:-}" ]; then
  echo ">>> prisma migrate resolve --rolled-back ${PRISMA_RESOLVE_ROLLED_BACK}"
  npx prisma migrate resolve --rolled-back "$PRISMA_RESOLVE_ROLLED_BACK"
fi

MIGRATE_SKIPPED=0
MIGRATE_RETRIES="${PRISMA_MIGRATE_RETRIES:-3}"
MIGRATE_RETRY_DELAY_SECONDS="${PRISMA_MIGRATE_RETRY_DELAY_SECONDS:-8}"

# Optional bypass for transient hosted DB reachability failures (P1001).
# Recommended use:
#   - deploy previews where schema changes are not required for static/page validation
#   - emergency frontend hotfix deploys while DB networking is being repaired
# Keep this OFF for strict production migration guarantees.
if [ -z "${ALLOW_PRISMA_P1001_BYPASS:-}" ]; then
  if [ "${NETLIFY_CONTEXT:-}" = "deploy-preview" ] && [ "${PRISMA_MIGRATE_OPTIONAL_IN_DEPLOY_PREVIEW:-1}" = "1" ]; then
    ALLOW_PRISMA_P1001_BYPASS="1"
  else
    ALLOW_PRISMA_P1001_BYPASS="0"
  fi
fi

attempt=1
while [ "$attempt" -le "$MIGRATE_RETRIES" ]; do
  echo ">>> prisma migrate deploy (attempt ${attempt}/${MIGRATE_RETRIES})"

  set +e
  MIGRATE_OUTPUT="$(npx prisma migrate deploy 2>&1)"
  MIGRATE_EXIT_CODE=$?
  set -e

  if [ "$MIGRATE_EXIT_CODE" -eq 0 ]; then
    echo "$MIGRATE_OUTPUT"
    break
  fi

  echo "$MIGRATE_OUTPUT"

  if [[ "$MIGRATE_OUTPUT" != *"P1001"* ]]; then
    echo ""
    echo "========================================================================"
    echo "  Build failed: prisma migrate deploy failed with a non-P1001 error."
    echo "  Refusing to continue because migration state may be unsafe."
    echo "========================================================================"
    echo ""
    exit "$MIGRATE_EXIT_CODE"
  fi

  if [ "$attempt" -lt "$MIGRATE_RETRIES" ]; then
    echo ">>> prisma migrate deploy hit P1001; retrying in ${MIGRATE_RETRY_DELAY_SECONDS}s..."
    sleep "$MIGRATE_RETRY_DELAY_SECONDS"
  else
    if [ "$ALLOW_PRISMA_P1001_BYPASS" = "1" ] || [ "$ALLOW_PRISMA_P1001_BYPASS" = "true" ] || [ "$ALLOW_PRISMA_P1001_BYPASS" = "yes" ]; then
      echo ""
      echo "========================================================================"
      echo "  WARNING: prisma migrate deploy failed with P1001 after ${MIGRATE_RETRIES} attempts."
      echo "  Continuing build because ALLOW_PRISMA_P1001_BYPASS is enabled."
      echo "  Database migration + seed were skipped for this deploy."
      echo "========================================================================"
      echo ""
      MIGRATE_SKIPPED=1
    else
      echo ""
      echo "========================================================================"
      echo "  Build failed: prisma migrate deploy failed with P1001 after ${MIGRATE_RETRIES} attempts."
      echo "  Hosted DB may be unreachable from Netlify right now."
      echo ""
      echo "  If this is a deploy-preview-only unblock, set:"
      echo "    ALLOW_PRISMA_P1001_BYPASS=1"
      echo "  Then rerun deploy and fix DB connectivity separately."
      echo "========================================================================"
      echo ""
      exit "$MIGRATE_EXIT_CODE"
    fi
  fi

  attempt=$((attempt + 1))
done

if [ "$MIGRATE_SKIPPED" = "1" ]; then
  echo ">>> prisma db seed skipped (migration was skipped due to P1001 bypass)"
elif [ "${SKIP_DB_SEED:-}" = "1" ] || [ "${SKIP_DB_SEED:-}" = "true" ] || [ "${SKIP_DB_SEED:-}" = "yes" ]; then
  echo ">>> prisma db seed skipped (SKIP_DB_SEED is set)"
else
  echo ">>> prisma db seed (baseline data; idempotent). Set SKIP_DB_SEED=1 to skip."
  set +e
  SEED_OUTPUT="$(npx prisma db seed 2>&1)"
  SEED_EXIT_CODE=$?
  set -e

  if [ "$SEED_EXIT_CODE" -eq 0 ]; then
    echo "$SEED_OUTPUT"
  else
    echo "$SEED_OUTPUT"

    if [[ "$SEED_OUTPUT" == *"P2022"* ]]; then
      if [ "${ALLOW_PRISMA_SEED_P2022_BYPASS:-0}" = "1" ] || [ "${ALLOW_PRISMA_SEED_P2022_BYPASS:-0}" = "true" ] || [ "${ALLOW_PRISMA_SEED_P2022_BYPASS:-0}" = "yes" ]; then
        echo ""
        echo "========================================================================"
        echo "  WARNING: prisma db seed failed with P2022 (schema drift: missing column)."
        echo "  Continuing build because ALLOW_PRISMA_SEED_P2022_BYPASS is enabled."
        echo "  Follow-up required: reconcile hosted database schema drift before re-enabling strict seed."
        echo "========================================================================"
        echo ""
      else
        echo ""
        echo "========================================================================"
        echo "  Build failed: prisma db seed hit P2022 (missing column in hosted schema)."
        echo ""
        echo "  Immediate unblock options:"
        echo "    1) Set SKIP_DB_SEED=1"
        echo "    2) Set ALLOW_PRISMA_SEED_P2022_BYPASS=1"
        echo ""
        echo "  Then repair DB schema drift and remove bypass settings."
        echo "========================================================================"
        echo ""
        exit "$SEED_EXIT_CODE"
      fi
    else
      exit "$SEED_EXIT_CODE"
    fi
  fi
fi

echo ">>> election plan workbench snapshot"
npm run election-plan:build

echo ">>> next build (NODE_ENV=production; npx next build — no H: npm-cache wrapper on CI)"
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}"
npx next build
unset NODE_OPTIONS 2>/dev/null || NODE_OPTIONS=

if [ -f "scripts/sanitize-next-trace-manifests.cjs" ]; then
  echo ">>> sanitize Next NFT manifests (drop npm-cache / absolute paths)"
  node scripts/sanitize-next-trace-manifests.cjs
fi

echo ">>> prune .next/cache (must not ship inside Netlify server handler)"
rm -rf .next/cache

echo ">>> Netlify server handler prune runs in netlify/plugins/prune-server-handler (onPostBuild, after Next packages the handler)"

if [ -f "scripts/analyze-next-trace-union.mjs" ]; then
  echo ">>> trace union size check (Next NFT — advisory; Netlify plugin prunes handler next)"
  node scripts/analyze-next-trace-union.mjs || echo ">>> trace union over 250 MB (continuing — prune-server-handler enforces real upload size)"
fi

if [ -f "scripts/verify-netlify-lambda-env-budget.cjs" ]; then
  echo ">>> Lambda env budget check (AWS 4 KB cap for function environment)"
  node scripts/verify-netlify-lambda-env-budget.cjs
fi
