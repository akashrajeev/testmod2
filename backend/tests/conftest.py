import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db, engine
from app.crud.category import seed_system_categories
from app.main import app


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator:
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_system_categories(db)
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db) -> Generator:
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def user1_auth(client) -> dict:
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "user1@example.com", "password": "password123", "full_name": "User One"}
    )
    data = res.json()
    token = data["access_token"]
    return {
        "headers": {"Authorization": f"Bearer {token}"},
        "user": data["user"]
    }


@pytest.fixture
def user2_auth(client) -> dict:
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "user2@example.com", "password": "password456", "full_name": "User Two"}
    )
    data = res.json()
    token = data["access_token"]
    return {
        "headers": {"Authorization": f"Bearer {token}"},
        "user": data["user"]
    }
