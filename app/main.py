from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting FastAPI application...")
    print("Attempting to connect to MySQL server...")
    initialize_database()
    print("Startup checks completed.")
    yield
    print("Shutting down FastAPI application...")


app = FastAPI(title="Restaurant Management System API", version="1.0.0", lifespan=lifespan)


@app.get("/")
def read_root() -> dict:
    return {"message": "Restaurant Management System API is running"}
