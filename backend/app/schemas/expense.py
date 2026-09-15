from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.category import CategoryResponse


class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    description: str = Field(..., min_length=1, max_length=255)
    category_id: str
    date: date
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    category_id: str
    amount: float
    description: str
    date: date
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedExpenses(BaseModel):
    items: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
