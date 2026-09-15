from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.crud.category import seed_system_categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables are created
    Base.metadata.create_all(bind=engine)
    # Seed default system categories
    db = SessionLocal()
    try:
        seed_system_categories(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


from fastapi.responses import RedirectResponse


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}


@app.get("/docs", include_in_schema=False)
def redirect_to_docs():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")
