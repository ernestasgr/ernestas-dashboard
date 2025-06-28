"""Main FastAPI application for the notes service."""

import logging
import os
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from strawberry.federation import Schema

from .database import create_tables
from .logger import logger
from .resolvers import Mutation, Query


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting notes service")
    await create_tables()
    logger.info("Database tables created/verified")
    yield
    logger.info("Shutting down notes service")


logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

sentry_dsn = os.getenv("SENTRY_DSN_NOTES")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        send_default_pii=os.getenv("SENTRY_SEND_DEFAULT_PII", "true").lower() == "true",
    )
    logger.info("Sentry configured for error tracking")

schema = Schema(query=Query, mutation=Mutation, enable_federation_2=True)

app = FastAPI(lifespan=lifespan)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
def read_root():
    """Root endpoint."""
    logger.info("Root endpoint accessed")
    return {"message": "Notes Service", "graphql_endpoint": "/graphql"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/sentry-debug")
async def trigger_error():
    """Debug endpoint to test Sentry integration."""
    logger.error("Test error triggered via /sentry-debug endpoint")
    raise Exception("This is a test exception for Sentry debugging.")
