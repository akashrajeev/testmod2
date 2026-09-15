def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword", "full_name": "Test User"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["full_name"] == "Test User"


def test_register_duplicate_email(client):
    payload = {"email": "duplicate@example.com", "password": "password123", "full_name": "User Dup"}
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "mypassword", "full_name": "Login User"}
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpass@example.com", "password": "correctpassword", "full_name": "Wrong Pass"}
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpass@example.com", "password": "incorrectpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_read_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_read_me_success(client, user1_auth):
    response = client.get("/api/v1/auth/me", headers=user1_auth["headers"])
    assert response.status_code == 200
    assert response.json()["email"] == "user1@example.com"
