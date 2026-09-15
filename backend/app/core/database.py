import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("uvicorn")


class Base(DeclarativeBase):
    pass


def create_db_engine():
    db_url = settings.DATABASE_URL
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    eng = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

    # Test database connectivity
    try:
        with eng.connect() as conn:
            pass
    except Exception as exc:
        if not db_url.startswith("sqlite"):
            print(f"\n[WARNING] Could not connect to PostgreSQL at '{db_url}'.")
            print("[INFO] Falling back to local SQLite database file ('sqlite:///./expensetracker.db') for local development.\n")
            fallback_url = "sqlite:///./expensetracker.db"
            eng = create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

    return eng


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
