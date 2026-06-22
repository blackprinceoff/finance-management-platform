import api from "./api";
import type { Income, IncomeRequest, Page } from "../types/finance";

export function getAll(
  page = 0,
  size = 20,
  categoryId?: number,
): Promise<Page<Income>> {
  const params: Record<string, string | number> = { page, size };
  if (categoryId !== undefined) params.categoryId = categoryId;
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
  return api.delete(`/incomes/${id}`).then(() => {});
}
