#!/bin/sh
set -e

echo "Starting production entrypoint..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Running Prisma migrate deploy..."
pnpm prisma migrate deploy

echo "Starting app..."
exec "$@"
