import api from "./api";
import type { Expense, ExpenseRequest } from "../types/finance";

export function getAll(categoryId?: number): Promise<Expense[]> {
  const params = categoryId !== undefined ? { categoryId } : undefined;
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
