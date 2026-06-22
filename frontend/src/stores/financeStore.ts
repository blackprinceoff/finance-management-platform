import { makeAutoObservable, runInAction } from "mobx";
import type {
  Budget,
  BudgetRequest,
  Category,
  CategoryRequest,
  Expense,
  ExpenseRequest,
  Goal,
  GoalRequest,
  Income,
  IncomeRequest,
  BudgetProgress,
  DashboardSummary,
} from "../types/finance";
import * as budgetService from "../services/budgetService";
import * as categoryService from "../services/categoryService";
import * as dashboardService from "../services/dashboardService";
import * as expenseService from "../services/expenseService";
import * as goalService from "../services/goalService";
import * as incomeService from "../services/incomeService";
import { extractErrorMessage } from "../utils/errorUtils";

class FinanceStore {
  budgets: Budget[] = [];
  categories: Category[] = [];
  expenses: Expense[] = [];
  goals: Goal[] = [];
  incomes: Income[] = [];
  dashboardSummary: DashboardSummary | null = null;
  budgetProgressList: BudgetProgress[] = [];

  // Pagination state for expenses
  expensePage = 0;
  expenseTotalPages = 0;
  expenseIsLastPage = true;

  // Pagination state for incomes
  incomePage = 0;
  incomeTotalPages = 0;
  incomeIsLastPage = true;

  expenseTotalSum = 0;
  incomeTotalSum = 0;

  categoriesLoading = false;
  expensesLoading = false;
  incomesLoading = false;
  budgetsLoading = false;
  goalsLoading = false;
  dashboardLoading = false;

  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Runs an async API call with standardized loading/error handling.
   * `loadingKey` ties to a specific loading flag so concurrent fetches don't clobber each other.
   */
  private async run<T>(
    loadingKey: "categoriesLoading" | "expensesLoading" | "incomesLoading" | "budgetsLoading" | "goalsLoading" | "dashboardLoading",
    fn: () => Promise<T>,
    onSuccess: (data: T) => void,
  ): Promise<boolean> {
    runInAction(() => {
      this[loadingKey] = true;
      this.error = null;
    });
    try {
      const data = await fn();
      runInAction(() => onSuccess(data));
      return true;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this[loadingKey] = false;
      });
    }
  }

  // ── Categories ──────────────────────────────────────────

  fetchCategories() {
    return this.run("categoriesLoading", () => categoryService.getAll(), (data) => {
      this.categories = data;
    });
  }

  createCategory(data: CategoryRequest) {
    return this.run("categoriesLoading", () => categoryService.create(data), () => {
      this.fetchCategories();
    });
  }

  updateCategory(id: number, data: CategoryRequest) {
    return this.run("categoriesLoading", () => categoryService.update(id, data), (updated) => {
      const idx = this.categories.findIndex((c) => c.id === id);
      if (idx !== -1) this.categories[idx] = updated;
    });
  }

  deleteCategory(id: number) {
    return this.run("categoriesLoading", () => categoryService.remove(id), () => {
      this.categories = this.categories.filter((c) => c.id !== id);
    });
  }

  // ── Expenses ────────────────────────────────────────────

  fetchExpenses(page = 0, categoryId?: number) {
    return this.run("expensesLoading", () => expenseService.getAll(page, 10, categoryId), (pageData) => {
      if (pageData.content.length === 0 && page > 0) {
        this.expensePage = page - 1;
        this.fetchExpenses(this.expensePage, categoryId);
        return;
      }
      this.expenses = pageData.content;
      this.expensePage = pageData.number;
      this.expenseTotalPages = pageData.totalPages;
      this.expenseIsLastPage = pageData.last;
      this.expenseTotalSum = pageData.totalSum;
    });
  }

  createExpense(data: ExpenseRequest) {
    return this.run("expensesLoading", () => expenseService.create(data), (created) => {
      this.expenses.unshift(created);
    });
  }

  updateExpense(id: number, data: ExpenseRequest) {
    return this.run("expensesLoading", () => expenseService.update(id, data), (updated) => {
      const idx = this.expenses.findIndex((e) => e.id === id);
      if (idx !== -1) this.expenses[idx] = updated;
    });
  }

  deleteExpense(id: number) {
    return this.run("expensesLoading", () => expenseService.remove(id), () => {
      this.fetchExpenses(this.expensePage);
    });
  }

  // ── Incomes ─────────────────────────────────────────────

  fetchIncomes(page = 0, categoryId?: number) {
    return this.run("incomesLoading", () => incomeService.getAll(page, 10, categoryId), (pageData) => {
      if (pageData.content.length === 0 && page > 0) {
        this.incomePage = page - 1;
        this.fetchIncomes(this.incomePage, categoryId);
        return;
      }
      this.incomes = pageData.content;
      this.incomePage = pageData.number;
      this.incomeTotalPages = pageData.totalPages;
      this.incomeIsLastPage = pageData.last;
      this.incomeTotalSum = pageData.totalSum;
    });
  }

  createIncome(data: IncomeRequest) {
    return this.run("incomesLoading", () => incomeService.create(data), (created) => {
      this.incomes.unshift(created);
    });
  }

  updateIncome(id: number, data: IncomeRequest) {
    return this.run("incomesLoading", () => incomeService.update(id, data), (updated) => {
      const idx = this.incomes.findIndex((i) => i.id === id);
      if (idx !== -1) this.incomes[idx] = updated;
    });
  }

  deleteIncome(id: number) {
    return this.run("incomesLoading", () => incomeService.remove(id), () => {
      this.fetchIncomes(this.incomePage);
    });
  }

  // ── Budgets ─────────────────────────────────────────────

  fetchBudgets() {
    return this.run("budgetsLoading", () => budgetService.getAll(), (data) => {
      this.budgets = data;
    });
  }

  createBudget(data: BudgetRequest) {
    return this.run("budgetsLoading", () => budgetService.create(data), (created) => {
      this.budgets.unshift(created);
    });
  }

  updateBudget(id: number, data: BudgetRequest) {
    return this.run("budgetsLoading", () => budgetService.update(id, data), (updated) => {
      const idx = this.budgets.findIndex((b) => b.id === id);
      if (idx !== -1) this.budgets[idx] = updated;
    });
  }

  deleteBudget(id: number) {
    return this.run("budgetsLoading", () => budgetService.remove(id), () => {
      this.budgets = this.budgets.filter((b) => b.id !== id);
    });
  }

  // ── Goals ───────────────────────────────────────────────

  fetchGoals() {
    return this.run("goalsLoading", () => goalService.getAll(), (data) => {
      this.goals = data;
    });
  }

  createGoal(data: GoalRequest) {
    return this.run("goalsLoading", () => goalService.create(data), (created) => {
      this.goals.unshift(created);
    });
  }

  updateGoal(id: number, data: GoalRequest) {
    return this.run("goalsLoading", () => goalService.update(id, data), (updated) => {
      const idx = this.goals.findIndex((g) => g.id === id);
      if (idx !== -1) this.goals[idx] = updated;
    });
  }

  deleteGoal(id: number) {
    return this.run("goalsLoading", () => goalService.remove(id), () => {
      this.goals = this.goals.filter((g) => g.id !== id);
    });
  }

  // ── Dashboard ───────────────────────────────────────────

  fetchDashboardData(month: number, year: number) {
    return this.run(
      "dashboardLoading",
      () => Promise.all([dashboardService.getSummary(month, year), dashboardService.getBudgetProgress(month, year)]),
      ([summary, progress]) => {
        this.dashboardSummary = summary;
        this.budgetProgressList = progress;
      },
    );
  }
}

const financeStore = new FinanceStore();
export default financeStore;
