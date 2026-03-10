#!/usr/bin/env bash
set -e

echo "==> Stopping dev server..."
pkill -f "next dev" 2>/dev/null || true

echo "==> Stopping Postgres..."
docker compose down

echo "==> Stopped."
