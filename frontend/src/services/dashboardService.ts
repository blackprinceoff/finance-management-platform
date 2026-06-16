import api from "./api";
import type { BudgetProgress, DashboardSummary } from "../types/finance";

export function getSummary(month: number, year: number): Promise<DashboardSummary> {
  return api.get("/dashboard/summary", { params: { month, year } }).then((res) => res.data);
}

export function getBudgetProgress(month: number, year: number): Promise<BudgetProgress[]> {
  return api.get("/dashboard/budgets", { params: { month, year } }).then((res) => res.data);
}
