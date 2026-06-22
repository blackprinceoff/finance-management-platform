import api from "./api";
import type { Expense, ExpenseRequest, TransactionPage } from "../types/finance";

export function getAll(
  page = 0,
  size = 10,
  categoryId?: number,
): Promise<TransactionPage<Expense>> {
  let url = `/expenses?page=${page}&size=${size}`;
  if (categoryId !== undefined) url += `&categoryId=${categoryId}`;
  return api.get(url).then((res) => res.data);
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
