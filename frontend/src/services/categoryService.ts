import api from "./api";
import type { Category, CategoryRequest } from "../types/finance";

export function getAll(): Promise<Category[]> {
  return api.get("/categories").then((res) => res.data);
}

export function getById(id: number): Promise<Category> {
  return api.get(`/categories/${id}`).then((res) => res.data);
}

export function create(data: CategoryRequest): Promise<Category> {
  return api.post("/categories", data).then((res) => res.data);
}

export function update(id: number, data: CategoryRequest): Promise<Category> {
  return api.put(`/categories/${id}`, data).then((res) => res.data);
}

export function remove(id: number): Promise<void> {
  return api.delete(`/categories/${id}`).then(() => {});
}
