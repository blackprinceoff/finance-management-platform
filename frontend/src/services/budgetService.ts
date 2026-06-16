import api from "./api";
import type { Budget, BudgetRequest } from "../types/finance";

export function getAll(): Promise<Budget[]> {
  return api.get("/budgets").then((res) => res.data);
}

export function getById(id: number): Promise<Budget> {
  return api.get(`/budgets/${id}`).then((res) => res.data);
}

export function create(data: BudgetRequest): Promise<Budget> {
  return api.post("/budgets", data).then((res) => res.data);
}

export function update(id: number, data: BudgetRequest): Promise<Budget> {
  return api.put(`/budgets/${id}`, data).then((res) => res.data);
}

export function remove(id: number): Promise<void> {
  return api.delete(`/budgets/${id}`);
}
