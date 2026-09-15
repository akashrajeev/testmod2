from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, extract, desc, asc
from app.models.expense import Expense
from app.models.category import Category
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.schemas.dashboard import CategorySpending, MonthlyTrend, DashboardSummary


def create_expense(db: Session, expense_in: ExpenseCreate, user_id: str) -> Expense:
    db_expense = Expense(
        user_id=user_id,
        category_id=expense_in.category_id,
        amount=expense_in.amount,
        description=expense_in.description,
        date=expense_in.date,
        notes=expense_in.notes,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expense_by_id(db: Session, expense_id: str, user_id: str) -> Optional[Expense]:
    return db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.id == expense_id,
        Expense.user_id == user_id
    ).first()


def update_expense(db: Session, db_expense: Expense, expense_in: ExpenseUpdate) -> Expense:
    update_data = expense_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, db_expense: Expense) -> None:
    db.delete(db_expense)
    db.commit()


def get_expenses(
    db: Session,
    user_id: str,
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: str = "date",
    sort_dir: str = "desc",
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[Expense], int]:
    query = db.query(Expense).options(joinedload(Expense.category)).filter(Expense.user_id == user_id)

    # Search filter
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Expense.description.ilike(search_term),
                Expense.notes.ilike(search_term)
            )
        )

    # Category filter
    if category_id:
        query = query.filter(Expense.category_id == category_id)

    # Date range filter
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)

    # Total count
    total = query.count()

    # Sorting
    sort_column = getattr(Expense, sort_by, Expense.date)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_column), asc(Expense.id))
    else:
        query = query.order_by(desc(sort_column), desc(Expense.id))

    # Pagination
    offset = (page - 1) * page_size
    expenses = query.offset(offset).limit(page_size).all()

    return expenses, total


def get_all_user_expenses(
    db: Session,
    user_id: str,
    category_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[Expense]:
    query = db.query(Expense).options(joinedload(Expense.category)).filter(Expense.user_id == user_id)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    return query.order_by(desc(Expense.date)).all()


def get_dashboard_summary(db: Session, user_id: str) -> DashboardSummary:
    today = date.today()
    current_year = today.year
    current_month = today.month

    # Current month start and end
    first_of_current_month = date(current_year, current_month, 1)
    
    # Previous month start and end
    if current_month == 1:
        prev_month_year = current_year - 1
        prev_month = 12
    else:
        prev_month_year = current_year
        prev_month = current_month - 1
    
    first_of_prev_month = date(prev_month_year, prev_month, 1)

    # Total spending
    total_spending_query = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(Expense.user_id == user_id).scalar()
    total_spending = float(total_spending_query or 0.0)

    # Current month spending
    curr_month_spending_query = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == user_id,
        Expense.date >= first_of_current_month
    ).scalar()
    current_month_spending = float(curr_month_spending_query or 0.0)

    # Previous month spending
    prev_month_spending_query = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
        Expense.user_id == user_id,
        Expense.date >= first_of_prev_month,
        Expense.date < first_of_current_month
    ).scalar()
    previous_month_spending = float(prev_month_spending_query or 0.0)

    # Percentage change vs previous month
    if previous_month_spending > 0:
        percentage_change = ((current_month_spending - previous_month_spending) / previous_month_spending) * 100.0
    elif current_month_spending > 0:
        percentage_change = 100.0
    else:
        percentage_change = 0.0

    # Spending by category
    cat_query = db.query(
        Expense.category_id,
        Category.name.label("category_name"),
        Category.color,
        Category.icon,
        func.coalesce(func.sum(Expense.amount), 0.0).label("total_amount")
    ).join(Category, Expense.category_id == Category.id).filter(
        Expense.user_id == user_id
    ).group_by(
        Expense.category_id, Category.name, Category.color, Category.icon
    ).order_by(desc("total_amount")).all()

    category_breakdown = []
    for row in cat_query:
        tot = float(row.total_amount)
        pct = (tot / total_spending * 100.0) if total_spending > 0 else 0.0
        category_breakdown.append(
            CategorySpending(
                category_id=row.category_id,
                category_name=row.category_name,
                color=row.color,
                icon=row.icon,
                total_amount=tot,
                percentage=round(pct, 2)
            )
        )

    # Monthly trends (last 6 months)
    monthly_trends = []
    for i in range(5, -1, -1):
        # Calculate target month
        m = current_month - i
        y = current_year
        while m <= 0:
            m += 12
            y -= 1
        
        m_start = date(y, m, 1)
        if m == 12:
            m_end = date(y + 1, 1, 1)
        else:
            m_end = date(y, m + 1, 1)

        m_amt = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
            Expense.user_id == user_id,
            Expense.date >= m_start,
            Expense.date < m_end
        ).scalar()

        month_name = m_start.strftime("%b %Y")
        monthly_trends.append(
            MonthlyTrend(
                year=y,
                month=m,
                month_name=month_name,
                total_amount=float(m_amt or 0.0)
            )
        )

    # Recent 5 expenses
    recent = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == user_id
    ).order_by(desc(Expense.date), desc(Expense.created_at)).limit(5).all()

    return DashboardSummary(
        total_spending=round(total_spending, 2),
        current_month_spending=round(current_month_spending, 2),
        previous_month_spending=round(previous_month_spending, 2),
        percentage_change=round(percentage_change, 1),
        category_breakdown=category_breakdown,
        monthly_trends=monthly_trends,
        recent_expenses=recent
    )
