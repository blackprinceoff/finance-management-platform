import { useEffect, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import * as adminService from "../services/adminService";
import type { AdminUser, AuditLog } from "../types/admin";
import { toast } from "react-hot-toast";

function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, logsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getAuditLogs(),
      ]);
      setUsers(usersData);
      setAuditLogs(logsData);
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
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          colors[status] ?? "bg-gray-100 text-gray-600"
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
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">
              Audit Logs
            </h2>
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
