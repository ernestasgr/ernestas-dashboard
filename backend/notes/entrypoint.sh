#!/bin/bash

echo "Starting Notes Service entrypoint..."

echo "Waiting for database connection..."
python -c "
import time
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

async def wait_for_db():
    database_url = os.getenv('DATABASE_URL', 'postgresql+asyncpg://user:password@db:5432/dashboard')
    engine = create_async_engine(database_url)
    
    max_retries = 30
    for i in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.execute(text('SELECT 1'))
            print('Database is ready!')
            break
        except Exception as e:
            print(f'Database not ready (attempt {i+1}/{max_retries}): {e}')
            time.sleep(2)
    else:
        print('Failed to connect to database after 30 attempts')
        exit(1)
    
    await engine.dispose()

asyncio.run(wait_for_db())
"

echo "Initializing Alembic..."
alembic stamp head 2>/dev/null || echo "Alembic already initialized or no migrations exist"

echo "Checking for schema changes..."
alembic revision --autogenerate -m "Auto-generated migration $(date +%Y%m%d_%H%M%S)" || echo "No schema changes detected"

echo "Applying database migrations..."
alembic upgrade head

echo "Database migrations completed successfully"

echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
