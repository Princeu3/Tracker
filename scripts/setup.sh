#!/usr/bin/env bash
set -e

echo "==> Installing dependencies..."
bun install

echo "==> Starting Postgres..."
docker compose up -d

echo "==> Waiting for Postgres to be ready..."
until docker compose exec -T db pg_isready -U tracker > /dev/null 2>&1; do
  sleep 1
done

echo "==> Running database migrations..."
DATABASE_URL=postgres://tracker:tracker_dev@localhost:5433/tracker bunx drizzle-kit migrate

echo "==> Setup complete! Run 'bun dev' or './scripts/start.sh' to start the app."
