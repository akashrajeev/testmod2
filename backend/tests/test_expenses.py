import pytest


def get_first_category_id(client, headers):
    res = client.get("/api/v1/categories", headers=headers)
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) > 0
    return categories[0]["id"]


def test_create_and_get_expense(client, user1_auth):
    cat_id = get_first_category_id(client, user1_auth["headers"])

    # Create expense
    payload = {
        "amount": 45.50,
        "description": "Lunch at Italian Diner",
        "category_id": cat_id,
        "date": "2026-09-10",
        "notes": "Delicious pasta"
    }
    create_res = client.post("/api/v1/expenses", json=payload, headers=user1_auth["headers"])
    assert create_res.status_code == 201
    expense_data = create_res.json()
    assert expense_data["amount"] == 45.50
    assert expense_data["description"] == "Lunch at Italian Diner"
    assert expense_data["category_id"] == cat_id
    expense_id = expense_data["id"]

    # Get single expense
    get_res = client.get(f"/api/v1/expenses/{expense_id}", headers=user1_auth["headers"])
    assert get_res.status_code == 200
    assert get_res.json()["id"] == expense_id


def test_user_data_isolation(client, user1_auth, user2_auth):
    cat_id = get_first_category_id(client, user1_auth["headers"])

    # User 1 creates expense
    payload = {
        "amount": 120.00,
        "description": "User 1 Secret Expense",
        "category_id": cat_id,
        "date": "2026-09-12"
    }
    create_res = client.post("/api/v1/expenses", json=payload, headers=user1_auth["headers"])
    expense_id = create_res.json()["id"]

    # User 2 tries to access User 1's expense -> 404
    user2_get = client.get(f"/api/v1/expenses/{expense_id}", headers=user2_auth["headers"])
    assert user2_get.status_code == 404

    # User 2 tries to list expenses -> User 1's expense should NOT be in User 2's list
    user2_list = client.get("/api/v1/expenses", headers=user2_auth["headers"])
    assert user2_list.json()["total"] == 0


def test_update_and_delete_expense(client, user1_auth):
    cat_id = get_first_category_id(client, user1_auth["headers"])

    # Create
    create_res = client.post("/api/v1/expenses", json={
        "amount": 20.00,
        "description": "Coffee",
        "category_id": cat_id,
        "date": "2026-09-14"
    }, headers=user1_auth["headers"])
    expense_id = create_res.json()["id"]

    # Update
    update_res = client.put(f"/api/v1/expenses/{expense_id}", json={
        "amount": 25.00,
        "description": "Specialty Coffee"
    }, headers=user1_auth["headers"])
    assert update_res.status_code == 200
    assert update_res.json()["amount"] == 25.00
    assert update_res.json()["description"] == "Specialty Coffee"

    # Delete
    del_res = client.delete(f"/api/v1/expenses/{expense_id}", headers=user1_auth["headers"])
    assert del_res.status_code == 204

    # Get after delete -> 404
    get_after_del = client.get(f"/api/v1/expenses/{expense_id}", headers=user1_auth["headers"])
    assert get_after_del.status_code == 404


def test_filtering_and_pagination(client, user1_auth):
    cat_id = get_first_category_id(client, user1_auth["headers"])

    # Seed 15 expenses
    for i in range(1, 16):
        client.post("/api/v1/expenses", json={
            "amount": float(i * 10),
            "description": f"Expense item #{i}",
            "category_id": cat_id,
            "date": f"2026-09-{i:02d}"
        }, headers=user1_auth["headers"])

    # Page 1 (limit 10)
    page1 = client.get("/api/v1/expenses?page=1&page_size=10", headers=user1_auth["headers"]).json()
    assert page1["total"] == 15
    assert page1["page"] == 1
    assert page1["total_pages"] == 2
    assert len(page1["items"]) == 10

    # Search filter
    search_res = client.get("/api/v1/expenses?q=item %235", headers=user1_auth["headers"]).json()
    assert search_res["total"] == 1
    assert search_res["items"][0]["description"] == "Expense item #5"

    # Date range filter
    range_res = client.get("/api/v1/expenses?start_date=2026-09-01&end_date=2026-09-05", headers=user1_auth["headers"]).json()
    assert range_res["total"] == 5
