export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_system: boolean;
  user_id?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  color: string;
  icon: string;
  total_amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  month_name: string;
  total_amount: number;
}

export interface DashboardSummary {
  total_spending: number;
  current_month_spending: number;
  previous_month_spending: number;
  percentage_change: number;
  category_breakdown: CategorySpending[];
  monthly_trends: MonthlyTrend[];
  recent_expenses: Expense[];
}

export interface CsvRowError {
  row_number: number;
  field: string;
  message: string;
  raw_data?: Record<string, any>;
}

export interface CsvImportSummary {
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  errors: CsvRowError[];
}
