#!/bin/sh
set -e

echo "Starting entrypoint..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ "$NODE_ENV" = "development" ]; then
  echo "Running Prisma migrate dev..."
  pnpm prisma migrate dev --name "auto-migration-$(date +%s)"
  
  echo "Running Prisma generate..."
  pnpm prisma generate
else
  echo "NODE_ENV=$NODE_ENV, skipping migrations and prisma generate"
fi

echo "Starting app..."
exec "$@"
