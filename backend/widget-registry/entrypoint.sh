#!/bin/sh

set -e

echo "Starting entrypoint script..."

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "DATABASE_URL is set, proceeding with migrations..."

if [ "$NODE_ENV" = "development" ]; then
    echo "Development mode detected - running migrate dev..."
    pnpm prisma migrate dev --name "auto-migration-$(date +%s)"
else
    echo "Production mode detected - running migrate deploy..."
    pnpm prisma migrate deploy
fi

echo "Database migrations completed successfully!"

echo "Starting the application..."
exec "$@"
