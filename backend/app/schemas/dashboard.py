from typing import List, Optional
from pydantic import BaseModel
from app.schemas.expense import ExpenseResponse


class CategorySpending(BaseModel):
    category_id: str
    category_name: str
    color: str
    icon: str
    total_amount: float
    percentage: float


class MonthlyTrend(BaseModel):
    year: int
    month: int
    month_name: str
    total_amount: float


class DashboardSummary(BaseModel):
    total_spending: float
    current_month_spending: float
    previous_month_spending: float
    percentage_change: float
    category_breakdown: List[CategorySpending]
    monthly_trends: List[MonthlyTrend]
    recent_expenses: List[ExpenseResponse]
