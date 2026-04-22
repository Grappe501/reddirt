#!/usr/bin/env bash
# Red Dirt — Unix/macOS one-step dev launcher
# Usage: chmod +x scripts/dev.sh && ./scripts/dev.sh

set -e
cd "$(dirname "$0")/.."

echo ""
echo "Red Dirt — dev launcher"
echo ""

if [[ ! -f .env.local && ! -f .env ]]; then
  echo "⚠ No .env.local or .env — copy .env.example to .env.local"
  echo ""
fi

echo "→ Docker Compose…"
if docker compose up -d; then
  echo "✓ Compose up"
  echo -n "→ waiting for Postgres"
  for _ in $(seq 1 45); do
    if docker compose exec -T db pg_isready -U reddirt -d reddirt >/dev/null 2>&1; then
      echo " — ready."
      break
    fi
    echo -n "."
    sleep 2
  done
else
  echo "⚠ docker compose failed — start Docker?"
fi
echo ""

echo "→ prisma generate…"
npx prisma generate

echo "→ prisma migrate deploy…"
if ! npx prisma migrate deploy; then
  echo "⚠ migrate deploy failed — try: npx prisma migrate dev"
fi
echo ""

echo "→ next dev…"
exec npx next dev
