import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import type {
  Budget,
  BudgetRequest,
  Category,
  CategoryRequest,
  Expense,
  ExpenseRequest,
  Income,
  IncomeRequest,
} from "../types/finance";
import * as budgetService from "../services/budgetService";
import * as categoryService from "../services/categoryService";
import * as expenseService from "../services/expenseService";
import * as incomeService from "../services/incomeService";

class FinanceStore {
  budgets: Budget[] = [];
  categories: Category[] = [];
  expenses: Expense[] = [];
  incomes: Income[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCategories(): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await categoryService.getAll();
      runInAction(() => {
        this.categories = data;
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createCategory(data: CategoryRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const category = await categoryService.create(data);
      runInAction(() => {
        this.categories.unshift(category);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateCategory(id: number, data: CategoryRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const updated = await categoryService.update(id, data);
      runInAction(() => {
        const index = this.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.categories[index] = updated;
        }
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      await categoryService.remove(id);
      runInAction(() => {
        this.categories = this.categories.filter((c) => c.id !== id);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchExpenses(categoryId?: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await expenseService.getAll(categoryId);
      runInAction(() => {
        this.expenses = data;
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createExpense(data: ExpenseRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const expense = await expenseService.create(data);
      runInAction(() => {
        this.expenses.unshift(expense);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateExpense(id: number, data: ExpenseRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const updated = await expenseService.update(id, data);
      runInAction(() => {
        const index = this.expenses.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.expenses[index] = updated;
        }
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      await expenseService.remove(id);
      runInAction(() => {
        this.expenses = this.expenses.filter((e) => e.id !== id);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchIncomes(categoryId?: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await incomeService.getAll(categoryId);
      runInAction(() => {
        this.incomes = data;
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createIncome(data: IncomeRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const income = await incomeService.create(data);
      runInAction(() => {
        this.incomes.unshift(income);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateIncome(id: number, data: IncomeRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const updated = await incomeService.update(id, data);
      runInAction(() => {
        const index = this.incomes.findIndex((i) => i.id === id);
        if (index !== -1) {
          this.incomes[index] = updated;
        }
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteIncome(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      await incomeService.remove(id);
      runInAction(() => {
        this.incomes = this.incomes.filter((i) => i.id !== id);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchBudgets(): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await budgetService.getAll();
      runInAction(() => {
        this.budgets = data;
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createBudget(data: BudgetRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const budget = await budgetService.create(data);
      runInAction(() => {
        this.budgets.unshift(budget);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateBudget(id: number, data: BudgetRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const updated = await budgetService.update(id, data);
      runInAction(() => {
        const index = this.budgets.findIndex((b) => b.id === id);
        if (index !== -1) {
          this.budgets[index] = updated;
        }
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteBudget(id: number): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      await budgetService.remove(id);
      runInAction(() => {
        this.budgets = this.budgets.filter((b) => b.id !== id);
      });
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(e)) {
    return e.response?.data?.error ?? e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "An unexpected error occurred";
}

const financeStore = new FinanceStore();
export default financeStore;
