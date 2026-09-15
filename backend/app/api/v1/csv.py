from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.services.csv_service import export_user_expenses_to_csv, process_csv_import
from app.schemas.csv import CsvImportSummary
from app.models.user import User

router = APIRouter()


@router.get("/export")
def export_expenses_csv(
    category_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_data = export_user_expenses_to_csv(
        db=db,
        user_id=current_user.id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date
    )
    filename = f"expenses_{date.today().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/import", response_model=CsvImportSummary)
async def import_expenses_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a .csv file."
        )

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            content_str = content_bytes.decode("latin1")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to decode CSV file encoding. Please upload UTF-8 encoded CSV."
            )

    return process_csv_import(db=db, user_id=current_user.id, file_content=content_str)
