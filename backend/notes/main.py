"""Main FastAPI application for the notes service."""

import logging
from contextlib import asynccontextmanager

from database import create_tables
from fastapi import FastAPI
from resolvers import Mutation, Query
from strawberry.fastapi import GraphQLRouter
from strawberry.federation import Schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    await create_tables()
    yield


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

schema = Schema(query=Query, mutation=Mutation, enable_federation_2=True)

app = FastAPI(lifespan=lifespan)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Notes Service", "graphql_endpoint": "/graphql"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
