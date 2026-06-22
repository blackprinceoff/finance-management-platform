import api from "./api";
import type { Income, IncomeRequest, TransactionPage } from "../types/finance";

export function getAll(
  page = 0,
  size = 10,
  categoryId?: number,
): Promise<TransactionPage<Income>> {
  let url = `/incomes?page=${page}&size=${size}`;
  if (categoryId !== undefined) url += `&categoryId=${categoryId}`;
  return api.get(url).then((res) => res.data);
}

export function getById(id: number): Promise<Income> {
  return api.get(`/incomes/${id}`).then((res) => res.data);
}

export function create(data: IncomeRequest): Promise<Income> {
  return api.post("/incomes", data).then((res) => res.data);
}

export function update(id: number, data: IncomeRequest): Promise<Income> {
  return api.put(`/incomes/${id}`, data).then((res) => res.data);
}

export function remove(id: number): Promise<void> {
  return api.delete(`/incomes/${id}`).then(() => {});
}
