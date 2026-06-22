import api from "./api";
import type { Expense, ExpenseRequest, Page } from "../types/finance";

export function getAll(
  page = 0,
  size = 20,
  categoryId?: number,
): Promise<Page<Expense>> {
  const params: Record<string, string | number> = { page, size };
  if (categoryId !== undefined) params.categoryId = categoryId;
  return api.get("/expenses", { params }).then((res) => res.data);
}

export function getById(id: number): Promise<Expense> {
  return api.get(`/expenses/${id}`).then((res) => res.data);
}

export function create(data: ExpenseRequest): Promise<Expense> {
  return api.post("/expenses", data).then((res) => res.data);
}

export function update(id: number, data: ExpenseRequest): Promise<Expense> {
  return api.put(`/expenses/${id}`, data).then((res) => res.data);
}

export function remove(id: number): Promise<void> {
  return api.delete(`/expenses/${id}`).then(() => {});
}
