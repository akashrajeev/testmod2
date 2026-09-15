from fastapi import APIRouter
from app.api.v1 import auth, categories, expenses, dashboard, csv

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(csv.router, prefix="/csv", tags=["CSV Import/Export"])
