import csv
import io
from datetime import datetime, date
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.crud.expense import get_all_user_expenses, create_expense
from app.crud.category import get_categories, get_category_by_name, create_category
from app.schemas.category import CategoryCreate
from app.schemas.expense import ExpenseCreate
from app.schemas.csv import CsvImportSummary, CsvRowError
from app.models.expense import Expense
from app.models.user import User


def export_user_expenses_to_csv(
    db: Session,
    user_id: str,
    category_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> str:
    expenses = get_all_user_expenses(
        db=db,
        user_id=user_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Category", "Amount", "Notes"])

    for expense in expenses:
        cat_name = expense.category.name if expense.category else "Uncategorized"
        writer.writerow([
            expense.date.strftime("%Y-%m-%d"),
            expense.description,
            cat_name,
            f"{float(expense.amount):.2f}",
            expense.notes or ""
        ])

    return output.getvalue()


def parse_date(date_str: str) -> Optional[date]:
    date_str = date_str.strip()
    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%b %d, %Y",
        "%B %d, %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def process_csv_import(
    db: Session,
    user_id: str,
    file_content: str
) -> CsvImportSummary:
    input_file = io.StringIO(file_content)
    reader = csv.reader(input_file)
    
    rows = list(reader)
    if not rows:
        return CsvImportSummary(
            total_rows=0,
            imported_rows=0,
            failed_rows=0,
            errors=[CsvRowError(row_number=0, field="file", message="CSV file is empty")]
        )

    # Normalize header names
    raw_header = rows[0]
    header_map = {}
    for idx, col in enumerate(raw_header):
        normalized = col.strip().lower()
        if "date" in normalized:
            header_map["date"] = idx
        elif "desc" in normalized or "title" in normalized or "item" in normalized:
            header_map["description"] = idx
        elif "cat" in normalized:
            header_map["category"] = idx
        elif "amount" in normalized or "cost" in normalized or "price" in normalized:
            header_map["amount"] = idx
        elif "note" in normalized or "comment" in normalized:
            header_map["notes"] = idx

    # Check required columns
    required_cols = ["date", "description", "category", "amount"]
    missing = [c for c in required_cols if c not in header_map]
    if missing:
        return CsvImportSummary(
            total_rows=len(rows) - 1,
            imported_rows=0,
            failed_rows=len(rows) - 1,
            errors=[
                CsvRowError(
                    row_number=1,
                    field="header",
                    message=f"Missing required CSV column(s): {', '.join(missing)}. Header must include Date, Description, Category, Amount."
                )
            ]
        )

    # Pre-fetch existing categories map (lowercased -> Category object)
    all_categories = get_categories(db=db, user_id=user_id)
    category_map: Dict[str, Any] = {c.name.lower(): c for c in all_categories}

    errors: List[CsvRowError] = []
    imported_count = 0
    total_data_rows = len(rows) - 1

    for row_idx, row in enumerate(rows[1:], start=2):
        if not row or not any(row):
            continue  # Skip blank rows

        raw_dict = {raw_header[i]: row[i] if i < len(row) else "" for i in range(len(raw_header))}

        # Extract values
        date_raw = row[header_map["date"]].strip() if header_map["date"] < len(row) else ""
        desc_raw = row[header_map["description"]].strip() if header_map["description"] < len(row) else ""
        cat_raw = row[header_map["category"]].strip() if header_map["category"] < len(row) else ""
        amount_raw = row[header_map["amount"]].strip() if header_map["amount"] < len(row) else ""
        notes_raw = row[header_map["notes"]].strip() if "notes" in header_map and header_map["notes"] < len(row) else ""

        # Validate Date
        parsed_date = parse_date(date_raw) if date_raw else None
        if not parsed_date:
            errors.append(
                CsvRowError(
                    row_number=row_idx,
                    field="date",
                    message=f"Invalid date '{date_raw}'. Expected format YYYY-MM-DD or MM/DD/YYYY.",
                    raw_data=raw_dict
                )
            )
            continue

        # Validate Description
        if not desc_raw:
            errors.append(
                CsvRowError(
                    row_number=row_idx,
                    field="description",
                    message="Description cannot be empty.",
                    raw_data=raw_dict
                )
            )
            continue

        # Validate Amount
        try:
            # Clean currency symbols if any
            clean_amt = amount_raw.replace("$", "").replace(",", "").strip()
            amount_val = float(clean_amt)
            if amount_val <= 0:
                raise ValueError("Amount must be positive")
        except ValueError:
            errors.append(
                CsvRowError(
                    row_number=row_idx,
                    field="amount",
                    message=f"Invalid positive amount '{amount_raw}'.",
                    raw_data=raw_dict
                )
            )
            continue

        # Category processing
        if not cat_raw:
            cat_raw = "Other"
        
        cat_key = cat_raw.lower()
        if cat_key in category_map:
            cat_obj = category_map[cat_key]
        else:
            # Create new custom category for user
            new_cat = create_category(
                db=db,
                category_in=CategoryCreate(name=cat_raw, color="#6B7280", icon="tag"),
                user_id=user_id
            )
            category_map[cat_key] = new_cat
            cat_obj = new_cat

        # Create expense record
        expense_in = ExpenseCreate(
            amount=amount_val,
            description=desc_raw[:255],
            category_id=cat_obj.id,
            date=parsed_date,
            notes=notes_raw or None
        )
        create_expense(db=db, expense_in=expense_in, user_id=user_id)
        imported_count += 1

    return CsvImportSummary(
        total_rows=total_data_rows,
        imported_rows=imported_count,
        failed_rows=len(errors),
        errors=errors
    )
