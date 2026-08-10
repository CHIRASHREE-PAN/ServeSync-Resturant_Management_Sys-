from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.staticfiles import StaticFiles

from app.api.routers.admin_router import router as admin_router
from app.api.routers.auth_router import router as auth_router
from app.api.routers.category_router import router as category_router
from app.api.routers.customer_session_router import router as customer_session_router
from app.api.routers.menu_router import router as menu_router
from app.api.routers.kitchen_router import router as kitchen_router
from app.api.routers.order_router import router as order_router
from app.api.routers.waiter_call_router import router as waiter_call_router
from app.api.routers.waiter_router import router as waiter_router
from app.api.routers.billing_router import router as billing_router
from app.api.routers.feedback_router import router as feedback_router
from app.api.routers.reports_router import router as reports_router
from app.core.exceptions import AppError, get_http_exception
from app.database import initialize_database


logger = logging.getLogger("restaurant_management")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FastAPI application...")
    logger.info("Attempting to connect to MySQL server...")

    initialize_database()

    logger.info("Startup checks completed.")

    yield

    logger.info("Shutting down FastAPI application...")


app = FastAPI(
    title="Restaurant Management System API",
    version="1.0.0",
    description="Production-style FastAPI backend for auth, OTP, and staff management.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------

@app.exception_handler(AppError)
async def app_error_handler(
    _: Request,
    exc: AppError,
) -> JSONResponse:
    http_exc = get_http_exception(exc)

    return JSONResponse(
        status_code=http_exc.status_code,
        content={"detail": http_exc.detail},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    _: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _: Request,
    exc: Exception,
) -> JSONResponse:
    logger.exception(
        "Unhandled internal server error",
        exc_info=exc,
    )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."},
    )


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(customer_session_router)
app.include_router(waiter_call_router)
app.include_router(waiter_router)
app.include_router(billing_router)
app.include_router(feedback_router)
app.include_router(reports_router)
app.include_router(category_router)
app.include_router(menu_router)
app.include_router(order_router)
app.include_router(kitchen_router)


# ---------------------------------------------------------
# Static files (for uploaded images)
# ---------------------------------------------------------

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------

@app.get("/")
def read_root() -> dict:
    return {
        "message": "Restaurant Management System API is running"
    }