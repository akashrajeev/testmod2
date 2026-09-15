from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.category import get_categories, create_category, get_category_by_name, seed_system_categories
from app.schemas.category import CategoryCreate, CategoryResponse
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_system_categories(db)
    return get_categories(db=db, user_id=current_user.id)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def add_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = get_category_by_name(db=db, user_id=current_user.id, name=category_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_in.name}' already exists."
        )
    return create_category(db=db, category_in=category_in, user_id=current_user.id)
