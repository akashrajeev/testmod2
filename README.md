# Full-Stack Personal Expense Tracker

A production-quality full-stack personal expense tracking application built with **React**, **TypeScript**, **FastAPI**, **PostgreSQL**, **Docker**, and **Tailwind CSS**.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |         React + TypeScript SPA        |
                      |   (Vite, Tailwind CSS, Recharts)     |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / REST (JWT Auth)
                                          v
                      +---------------------------------------+
                      |            FastAPI Backend            |
                      | (Python 3.12, SQLAlchemy 2.0, PyJWT)   |
                      +-------------------+-------------------+
                                          |
                                          | PostgreSQL Protocol
                                          v
                      +---------------------------------------+
                      |          PostgreSQL Database          |
                      |  (Users, Categories, Expense Tables)  |
                      +---------------------------------------+
```

### Key Architectural Decisions

1. **Separation of Concerns & Layered Architecture**:
   - Backend follows a clean 3-tier structure (`api` -> `crud`/`services` -> `models`/`database`).
   - Domain logic and database access are strictly decoupled from API controller endpoints.
   - Pydantic v2 schemas enforce request validation and clean response serialization.

2. **Database Performance & Schema Design**:
   - Explicit normalized relational schema using primary/foreign keys (`users`, `categories`, `expenses`).
   - Foreign key constraints with cascading deletes for user cleanup and restricted category deletes to preserve expense records.
   - Positive amount check constraints (`CHECK (amount > 0)`).
   - Composite indexes (`idx_expenses_user_date` on `(user_id, date DESC)` and `idx_expenses_user_category` on `(user_id, category_id)`) to optimize pagination, filtering, and aggregated dashboard analytics.

3. **Authentication & Security**:
   - JWT authentication via `Authorization: Bearer <token>` header.
   - Passwords hashed using native `bcrypt` with unique salts.
   - Strict row-level user authorization ensuring users can only read, update, delete, export, or import their own expense data.

4. **CSV Import/Export Engine**:
   - Flexible CSV parser handling variable column naming (e.g. `Date`, `Description`, `Category`, `Amount`, `Notes`).
   - Row-by-row validation supporting multiple date formats (`YYYY-MM-DD`, `MM/DD/YYYY`).
   - Auto-category matching and custom category creation.
   - Detailed validation feedback containing total rows, imported count, failed count, and row-level error breakdown.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router DOM v6.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyJWT, Bcrypt.
- **Database & Migrations**: PostgreSQL 16, Alembic.
- **Testing**: Pytest, HTTPX, SQLite in-memory static pool.
- **Containerization**: Docker, Docker Compose, Nginx.

---

## Project Structure

```
.
├── backend/
│   ├── alembic/                # Alembic database migrations
│   │   ├── versions/           # Schema migration scripts
│   │   └── env.py
│   ├── app/
│   │   ├── api/                # API router endpoints
│   │   │   ├── deps.py         # Authentication & DB dependencies
│   │   │   └── v1/             # API v1 routes (auth, expenses, dashboard, csv, categories)
│   │   ├── core/               # App configuration, DB engine, security
│   │   ├── crud/               # Database access layer
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic data schemas
│   │   ├── services/           # CSV import/export service logic
│   │   └── main.py             # FastAPI entrypoint
│   ├── tests/                  # Pytest test suite
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_csv.py
│   │   └── test_expenses.py
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # Modular React UI components
│   │   │   ├── common/         # Spinner, Toast, EmptyState
│   │   │   ├── csv/            # CsvImportModal, CsvExportButton
│   │   │   ├── dashboard/      # SummaryCards, Charts, RecentExpenses
│   │   │   ├── expenses/       # ExpenseList, ExpenseFilters, Modals
│   │   │   └── layout/         # Navbar, Sidebar
│   │   ├── context/            # AuthContext state provider
│   │   ├── pages/              # Login, Register, Dashboard, Expenses pages
│   │   ├── services/           # Axios API client
│   │   ├── types/              # TypeScript types & interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx production configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start with Docker Compose

1. **Clone & Configure**:
   ```bash
   cp .env.example .env
   ```

2. **Start All Services**:
   ```bash
   docker compose up --build -d
   ```

3. **Access Application**:
   - **Frontend UI**: [http://localhost](http://localhost) (or `http://localhost:80`)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs (Swagger)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

---

## Local Development Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend dev server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend dev server will start at `http://localhost:5173` and automatically proxy `/api` calls to Uvicorn at `http://localhost:8000`.

---

## Running Automated Tests

The backend test suite uses `pytest` with an isolated SQLite in-memory database to test authentication, data authorization rules, expense CRUD, filters, pagination, and CSV import validation.

```bash
cd backend
python -m pytest tests -v
```

### Verification Results
```
tests/test_auth.py::test_register_user PASSED
tests/test_auth.py::test_register_duplicate_email PASSED
tests/test_auth.py::test_login_success PASSED
tests/test_auth.py::test_login_invalid_password PASSED
tests/test_auth.py::test_read_me_unauthorized PASSED
tests/test_auth.py::test_read_me_success PASSED
tests/test_csv.py::test_csv_export PASSED
tests/test_csv.py::test_csv_import_valid PASSED
tests/test_csv.py::test_csv_import_validation_errors PASSED
tests/test_expenses.py::test_create_and_get_expense PASSED
tests/test_expenses.py::test_user_data_isolation PASSED
tests/test_expenses.py::test_update_and_delete_expense PASSED
tests/test_expenses.py::test_filtering_and_pagination PASSED

13 passed in 4.13s
```

To test the frontend TypeScript build:
```bash
cd frontend
npm run build
```

---

## Database Migrations (Alembic)

To create a new migration after updating SQLAlchemy models:
```bash
cd backend
alembic revision --autogenerate -m "Add new field to expenses"
alembic upgrade head
```

---

## Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `expensetracker` | Database name |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/expensetracker` | Database connection string |
| `SECRET_KEY` | `super-secret-key-change-in-production...` | Secret key for JWT signing |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Token expiration duration |

---

## API Documentation Summary

- `POST /api/v1/auth/register`: Register new user account.
- `POST /api/v1/auth/login`: Authenticate and receive JWT access token.
- `GET /api/v1/auth/me`: Get current authenticated user profile.
- `GET /api/v1/categories`: List default system & custom user categories.
- `POST /api/v1/categories`: Create a new custom category.
- `GET /api/v1/expenses`: List paginated expenses (filters: `q`, `category_id`, `start_date`, `end_date`, `sort_by`, `sort_dir`, `page`, `page_size`).
- `POST /api/v1/expenses`: Create a new expense.
- `GET /api/v1/expenses/{id}`: Get expense details.
- `PUT /api/v1/expenses/{id}`: Update expense details.
- `DELETE /api/v1/expenses/{id}`: Delete an expense.
- `GET /api/v1/dashboard/summary`: Aggregated dashboard metrics (totals, monthly comparison, trends, category breakdown, recent expenses).
- `GET /api/v1/csv/export`: Export filtered expenses as a CSV file download stream.
- `POST /api/v1/csv/import`: Upload and process a CSV file with row-level validation.

---

## Known Limitations & Future Enhancements

1. **Multi-Currency Support**: Currently defaults to USD (`$`). Multi-currency conversion via an external FX rate API could be added in a future update.
2. **Recurring Expenses**: Support for automated scheduled recurring transactions (e.g. monthly subscriptions).
3. **Advanced Budgeting**: Setting monthly category spending limits with alert threshold notifications.
