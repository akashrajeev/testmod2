import io


def test_csv_export(client, user1_auth):
    cat_res = client.get("/api/v1/categories", headers=user1_auth["headers"])
    cat_id = cat_res.json()[0]["id"]

    client.post("/api/v1/expenses", json={
        "amount": 100.00,
        "description": "Export Test Item",
        "category_id": cat_id,
        "date": "2026-09-01",
        "notes": "Export notes"
    }, headers=user1_auth["headers"])

    res = client.get("/api/v1/csv/export", headers=user1_auth["headers"])
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    content = res.text
    assert "Export Test Item" in content
    assert "100.00" in content


def test_csv_import_valid(client, user1_auth):
    csv_content = """Date,Description,Category,Amount,Notes
2026-09-02,Grocery Store,Food & Dining,65.40,Weekly groceries
2026-09-03,Gas Station,Transportation,35.00,Fuel fill up
"""
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/v1/csv/import",
        files={"file": ("test.csv", file_bytes, "text/csv")},
        headers=user1_auth["headers"]
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 2
    assert data["imported_rows"] == 2
    assert data["failed_rows"] == 0

    # Verify expenses were added to database
    list_res = client.get("/api/v1/expenses", headers=user1_auth["headers"])
    assert list_res.json()["total"] == 2


def test_csv_import_validation_errors(client, user1_auth):
    csv_content = """Date,Description,Category,Amount,Notes
2026-09-02,Good Row,Food & Dining,50.00,Fine
invalid-date,Bad Date,Food & Dining,20.00,Error
2026-09-04,,Food & Dining,30.00,Missing description
2026-09-05,Negative Amount,Transportation,-10.00,Error
"""
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/v1/csv/import",
        files={"file": ("test_invalid.csv", file_bytes, "text/csv")},
        headers=user1_auth["headers"]
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 4
    assert data["imported_rows"] == 1
    assert data["failed_rows"] == 3
    assert len(data["errors"]) == 3
    fields = [err["field"] for err in data["errors"]]
    assert "date" in fields
    assert "description" in fields
    assert "amount" in fields
