from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CsvRowError(BaseModel):
    row_number: int
    field: str
    message: str
    raw_data: Optional[Dict[str, Any]] = None


class CsvImportSummary(BaseModel):
    total_rows: int
    imported_rows: int
    failed_rows: int
    errors: List[CsvRowError]
