#!/usr/bin/env bash
set -e

echo "==> Starting Postgres..."
docker compose up -d

echo "==> Waiting for Postgres to be ready..."
until docker compose exec -T db pg_isready -U tracker > /dev/null 2>&1; do
  sleep 1
done

echo "==> Starting dev server..."
bun dev
