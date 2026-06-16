import api from "./api";
import type { Goal, GoalRequest } from "../types/finance";

export function getAll(): Promise<Goal[]> {
  return api.get("/goals").then((res) => res.data);
}

export function getById(id: number): Promise<Goal> {
  return api.get(`/goals/${id}`).then((res) => res.data);
}

export function create(data: GoalRequest): Promise<Goal> {
  return api.post("/goals", data).then((res) => res.data);
}

export function update(id: number, data: GoalRequest): Promise<Goal> {
  return api.put(`/goals/${id}`, data).then((res) => res.data);
}

export function remove(id: number): Promise<void> {
  return api.delete(`/goals/${id}`);
}
