from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field("#6B7280", max_length=20)
    icon: str = Field("tag", max_length=50)


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    is_system: bool
    user_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
