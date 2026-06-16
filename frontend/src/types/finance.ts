export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  isGlobal: boolean;
  userId: number | null;
}

export interface Expense {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  categoryId: number;
  categoryName: string;
  userId: number;
}

export interface Income {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  categoryId: number;
  categoryName: string;
  userId: number;
}

export interface CategoryRequest {
  name: string;
  type: CategoryType;
  isGlobal: boolean;
}

export interface ExpenseRequest {
  amount: number;
  description?: string;
  date: string;
  categoryId: number;
}

export interface IncomeRequest {
  amount: number;
  description?: string;
  date: string;
  categoryId: number;
}

export interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  categoryId: number;
  categoryName: string;
  userId: number;
}

export interface BudgetRequest {
  amount: number;
  month: number;
  year: number;
  categoryId: number;
}
