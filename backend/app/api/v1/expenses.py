import math
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.expense import (
    create_expense, get_expense_by_id, update_expense, delete_expense, get_expenses
)
from app.crud.category import get_category_by_id
from app.schemas.expense import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, PaginatedExpenses
)
from app.models.user import User

router = APIRouter()


@router.get("", response_model=PaginatedExpenses)
def read_expenses(
    q: Optional[str] = Query(None, description="Search description or notes"),
    category_id: Optional[str] = Query(None, description="Filter by Category ID"),
    start_date: Optional[date] = Query(None, description="Filter from start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter to end date (YYYY-MM-DD)"),
    sort_by: str = Query("date", description="Field to sort by (date, amount, description)"),
    sort_dir: str = Query("desc", description="Sort direction (asc, desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses, total = get_expenses(
        db=db,
        user_id=current_user.id,
        q=q,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedExpenses(
        items=expenses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = get_category_by_id(db, expense_in.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return create_expense(db=db, expense_in=expense_in, user_id=current_user.id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense_by_id(db, expense_id=expense_id, user_id=current_user.id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or unauthorized"
        )
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def edit_expense(
    expense_id: str,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense_by_id(db, expense_id=expense_id, user_id=current_user.id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or unauthorized"
        )

    if expense_in.category_id:
        category = get_category_by_id(db, expense_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

    return update_expense(db=db, db_expense=expense, expense_in=expense_in)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense_by_id(db, expense_id=expense_id, user_id=current_user.id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or unauthorized"
        )
    delete_expense(db=db, db_expense=expense)
    return None
