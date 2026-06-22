import { useEffect, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import { formatLocalDate, parseLocalDate } from "../utils/formatUtils";
import * as adminService from "../services/adminService";
import type { AdminUser, AuditLog } from "../types/admin";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];
  const current = currentPage + 1;
  const last = totalPages;

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(last - 1, current + 1);

  if (rangeStart > 2) pages.push("...");

  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

  if (rangeEnd < last - 1) pages.push("...");

  if (last > 1) pages.push(last);

  return pages;
}

function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchUsers = async (pageNum: number) => {
    try {
      const usersData = await adminService.getUsers(pageNum, 10);
      setUsers(usersData.content);
      setUsersTotalPages(usersData.totalPages);
      setUsersPage(usersData.number);
    } catch {
      setError("Failed to load users.");
    }
  };

  const fetchAuditLogs = async (pageNum: number, start?: string, end?: string) => {
    try {
      const startParam = start ? start + "T00:00:00" : undefined;
      const endParam = end ? end + "T23:59:59.999" : undefined;
      const logsData = await adminService.getAuditLogs(pageNum, 10, startParam, endParam);
      setAuditLogs(logsData.content);
      setLogsTotalPages(logsData.totalPages);
      setLogsPage(logsData.number);
    } catch {
      // silent — non-critical refresh
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, logsData] = await Promise.all([
        adminService.getUsers(0, 10),
        adminService.getAuditLogs(0, 10),
      ]);
      setUsers(usersData.content);
      setUsersTotalPages(usersData.totalPages);
      setUsersPage(usersData.number);

      setAuditLogs(logsData.content);
      setLogsTotalPages(logsData.totalPages);
      setLogsPage(logsData.number);
    } catch {
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlock = async (id: number) => {
    setActionId(id);
    try {
      await adminService.blockUser(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "BLOCKED" as const } : u)),
      );
      toast.success("User blocked successfully");
      fetchAuditLogs(0);
    } catch {
      setError("Failed to block user.");
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: number) => {
    setActionId(id);
    try {
      await adminService.unblockUser(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "ACTIVE" as const } : u)),
      );
      toast.success("User unblocked successfully");
      fetchAuditLogs(0);
    } catch {
      setError("Failed to unblock user.");
    } finally {
      setActionId(null);
    }
  };

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      BLOCKED: "bg-red-100 text-red-700",
      BANNED: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="admin" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <section className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">Users</h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-apple-100 text-apple-400">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Roles</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-50">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-apple-50"
                    >
                      <td className="px-6 py-4 text-apple-500">{user.id}</td>
                      <td className="px-6 py-4 font-medium text-apple-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">{statusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-apple-500">
                        {user.roles.join(", ")}
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "ACTIVE" && (
                          <Button
                            variant="secondary"
                            isLoading={actionId === user.id}
                            onClick={() => handleBlock(user.id)}
                            className="!bg-red-50 !text-red-600 hover:!bg-red-100"
                          >
                            Block
                          </Button>
                        )}
                        {user.status === "BLOCKED" && (
                          <Button
                            variant="secondary"
                            isLoading={actionId === user.id}
                            onClick={() => handleUnblock(user.id)}
                            className="!bg-green-50 !text-green-700 hover:!bg-green-100"
                          >
                            Unblock
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-center gap-1 border-t border-apple-100 px-6 py-4">
                <button
                  disabled={usersPage === 0}
                  onClick={() => fetchUsers(usersPage - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous Page"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers(usersPage, usersTotalPages).map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-users-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchUsers(Number(page) - 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${page === usersPage + 1
                          ? "bg-gray-900 font-medium text-white"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={usersPage >= usersTotalPages - 1}
                  onClick={() => fetchUsers(usersPage + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next Page"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">
              Audit Logs
            </h2>
            <div className="flex items-center gap-3">
              <DatePicker
                selectsRange={true}
                startDate={startDate ? parseLocalDate(startDate) : null}
                endDate={endDate ? parseLocalDate(endDate) : null}
                onChange={(dates: [Date | null, Date | null]) => {
                  const [start, end] = dates;
                  setStartDate(start ? formatLocalDate(start) : "");
                  setEndDate(end ? formatLocalDate(end) : "");
                }}
                isClearable={true}
                placeholderText="Start Date – End Date"
                dateFormat="MMM d, yyyy"
                className="w-64 rounded-lg border border-apple-200 px-3 py-1.5 pr-8 text-sm text-apple-700 focus:border-apple-400 focus:outline-none cursor-pointer"
              />
              <Button
                variant="secondary"
                onClick={() => fetchAuditLogs(0, startDate || undefined, endDate || undefined)}
              >
                Filter
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-apple-100 text-apple-400">
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">User ID</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-50">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-apple-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-apple-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-apple-500">{log.userId}</td>
                      <td className="px-6 py-4 font-medium text-apple-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-apple-400">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-center gap-1 border-t border-apple-100 px-6 py-4">
                <button
                  disabled={logsPage === 0}
                  onClick={() => fetchAuditLogs(logsPage - 1, startDate || undefined, endDate || undefined)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous Page"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers(logsPage, logsTotalPages).map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-logs-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => fetchAuditLogs(Number(page) - 1, startDate || undefined, endDate || undefined)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${page === logsPage + 1
                          ? "bg-gray-900 font-medium text-white"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={logsPage >= logsTotalPages - 1}
                  onClick={() => fetchAuditLogs(logsPage + 1, startDate || undefined, endDate || undefined)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next Page"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
