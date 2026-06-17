import api from "./api";
import type { AdminUser, AuditLog } from "../types/admin";

export function getUsers(): Promise<AdminUser[]> {
  return api.get("/admin/users").then((res) => res.data);
}

export function blockUser(id: number): Promise<void> {
  return api.put(`/admin/users/${id}/block`).then(() => {});
}

export function unblockUser(id: number): Promise<void> {
  return api.put(`/admin/users/${id}/unblock`).then(() => {});
}

export function getAuditLogs(): Promise<AuditLog[]> {
  return api.get("/admin/audit-logs").then((res) => res.data);
}
