import api from "./api";
import type { Income, IncomeRequest } from "../types/finance";

export function getAll(categoryId?: number): Promise<Income[]> {
  const params = categoryId !== undefined ? { categoryId } : undefined;
  return api.get("/incomes", { params }).then((res) => res.data);
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
  return api.delete(`/incomes/${id}`);
}
