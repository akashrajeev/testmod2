from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.crud.expense import get_dashboard_summary
from app.schemas.dashboard import DashboardSummary
from app.models.user import User

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def read_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(db=db, user_id=current_user.id)
