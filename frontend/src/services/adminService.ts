import api from "./api";
import type { AdminUser, AuditLog } from "../types/admin";

export interface AdminUserPage {
  content: AdminUser[];
  totalPages: number;
  number: number;
}

export function getUsers(page = 0, size = 10, email?: string): Promise<AdminUserPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (email) params.append("email", email);
  return api.get(`/admin/users?${params.toString()}`).then((res) => res.data);
}

export function blockUser(id: number): Promise<void> {
  return api.put(`/admin/users/${id}/block`).then(() => {});
}

export function unblockUser(id: number): Promise<void> {
  return api.put(`/admin/users/${id}/unblock`).then(() => {});
}

export interface AuditLogPage {
  content: AuditLog[];
  totalPages: number;
  number: number;
}

export function getAuditLogs(
  page: number,
  size: number,
  startDate?: string,
  endDate?: string,
): Promise<AuditLogPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  return api.get(`/admin/audit-logs?${params.toString()}`).then((res) => res.data);
}
