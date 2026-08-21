from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.database import Base, engine

# ============================================================
# MODELS
# ============================================================

from app.models.users import User
from app.models.quiz import Question, QuizAttempt


# ============================================================
# API ROUTERS
# ============================================================

from app.api.users import router as users_router
from app.api.quiz import router as quiz_router
from app.api.dashboard import router as dashboard_router
from app.api.categories import router as categories_router
from app.api.history import router as history_router
from app.api.admin import router as admin_router
from app.api.admin_users import router as admin_users_router


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="LearnHub API",
    description="Backend API for LearnHub - Where Learning Becomes Mastery",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REGISTER API ROUTERS
# ============================================================

app.include_router(users_router)

app.include_router(quiz_router)

app.include_router(dashboard_router)

app.include_router(categories_router)

app.include_router(history_router)

app.include_router(admin_router)

app.include_router(admin_users_router)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Welcome to LearnHub API",
        "status": "running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# ============================================================
# DATABASE CONNECTION TEST
# ============================================================

@app.get("/database-test")
def database_test():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 1")
        )

        return {
            "database": "connected",
            "result": result.scalar()
        }