import axios from 'axios';
import {
  AuthResponse,
  Category,
  DashboardSummary,
  Expense,
  PaginatedExpenses,
  User,
  CsvImportSummary
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: { email: string; password: string; full_name: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  createCategory: async (data: { name: string; color?: string; icon?: string }): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
};

export const expenseService = {
  getExpenses: async (params: {
    q?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedExpenses> => {
    const response = await api.get<PaginatedExpenses>('/expenses', { params });
    return response.data;
  },
  getExpense: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },
  createExpense: async (data: {
    amount: number;
    description: string;
    category_id: string;
    date: string;
    notes?: string;
  }): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },
  updateExpense: async (
    id: string,
    data: {
      amount?: number;
      description?: string;
      category_id?: string;
      date?: string;
      notes?: string;
    }
  ): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};

export const csvService = {
  exportCsv: async (params?: { category_id?: string; start_date?: string; end_date?: string }): Promise<Blob> => {
    const response = await api.get('/csv/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
  importCsv: async (file: File): Promise<CsvImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<CsvImportSummary>('/csv/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
