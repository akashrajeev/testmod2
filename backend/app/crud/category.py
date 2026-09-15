from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.category import Category
from app.schemas.category import CategoryCreate

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#EF4444", "icon": "utensils", "is_system": True},
    {"name": "Transportation", "color": "#3B82F6", "icon": "car", "is_system": True},
    {"name": "Housing & Utilities", "color": "#10B981", "icon": "home", "is_system": True},
    {"name": "Entertainment", "color": "#8B5CF6", "icon": "film", "is_system": True},
    {"name": "Health & Fitness", "color": "#EC4899", "icon": "heart-pulse", "is_system": True},
    {"name": "Shopping", "color": "#F59E0B", "icon": "shopping-bag", "is_system": True},
    {"name": "Income / Salary", "color": "#059669", "icon": "wallet", "is_system": True},
    {"name": "Other", "color": "#6B7280", "icon": "tag", "is_system": True},
]


def seed_system_categories(db: Session) -> None:
    for cat in DEFAULT_CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat["name"], Category.is_system == True).first()
        if not existing:
            db_cat = Category(
                name=cat["name"],
                color=cat["color"],
                icon=cat["icon"],
                is_system=True,
                user_id=None
            )
            db.add(db_cat)
    db.commit()


def get_categories(db: Session, user_id: str) -> List[Category]:
    # Returns system categories + custom categories for this user
    return db.query(Category).filter(
        or_(Category.is_system == True, Category.user_id == user_id)
    ).order_by(Category.name.asc()).all()


def get_category_by_id(db: Session, category_id: str) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_name(db: Session, user_id: str, name: str) -> Optional[Category]:
    return db.query(Category).filter(
        or_(Category.is_system == True, Category.user_id == user_id),
        Category.name.ilike(name.strip())
    ).first()


def create_category(db: Session, category_in: CategoryCreate, user_id: str) -> Category:
    db_category = Category(
        name=category_in.name,
        color=category_in.color,
        icon=category_in.icon,
        is_system=False,
        user_id=user_id,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category
