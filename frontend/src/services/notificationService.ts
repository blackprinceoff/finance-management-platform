import api from "./api";
import type { Notification } from "../types/finance";

export function getAll(): Promise<Notification[]> {
  return api.get("/notifications").then((res) => res.data);
}

export function markAsRead(id: number): Promise<void> {
  return api.put(`/notifications/${id}/read`).then(() => {});
}
