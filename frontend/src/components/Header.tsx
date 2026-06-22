import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../stores/authStore";
import notificationStore from "../stores/notificationStore";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";

interface HeaderProps {
  currentPage: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transactions", path: "/transactions" },
  { label: "Budgets", path: "/budgets" },
  { label: "Goals", path: "/goals" },
  { label: "Categories", path: "/categories" },
];

function Header({ currentPage }: HeaderProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationStore.fetchNotifications();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    authStore.logout();
    navigate("/auth");
    setIsLogoutModalOpen(false);
  };

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) {
      notificationStore.markAsRead(id);
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <header className="grid grid-cols-3 items-center border-b border-apple-200 bg-white px-6 py-4">
      <div className="flex justify-start">
        <Link
          to="/dashboard"
          className="text-lg font-semibold text-apple-900 transition-opacity hover:opacity-80"
        >
          Finance Platform
        </Link>
      </div>

      <nav className="flex items-center justify-center gap-6">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`text-sm font-medium transition-colors ${
              currentPage === item.label.toLowerCase()
                ? "text-apple-blue hover:text-apple-blue-hover"
                : "text-apple-500 hover:text-apple-900"
            }`}
          >
            {item.label}
          </button>
        ))}
        {authStore.isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className={`whitespace-nowrap text-sm font-medium transition-colors ${
              currentPage === "admin"
                ? "text-apple-blue hover:text-apple-blue-hover"
                : "text-apple-500 hover:text-apple-900"
            }`}
          >
            Admin Panel
          </button>
        )}
      </nav>

      <div className="flex items-center justify-end gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="relative rounded-full p-2 text-apple-500 transition-colors hover:bg-apple-100 hover:text-apple-900"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationStore.unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white">
                {notificationStore.unreadCount > 9
                  ? "9+"
                  : notificationStore.unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-apple-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-apple-100 px-5 py-3">
                <p className="text-sm font-semibold text-apple-900">
                  Notifications
                </p>
                {notificationStore.notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      await notificationStore.clearAll();
                      setDropdownOpen(false);
                    }}
                    className="text-xs font-medium text-apple-500 transition-colors hover:text-apple-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificationStore.notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-apple-400">
                    No notifications yet.
                  </div>
                ) : (
                  notificationStore.notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.isRead)}
                      className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-apple-50 ${
                        !n.isRead ? "bg-apple-50/50" : ""
                      }`}
                    >
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-apple-blue" />
                      )}
                      {n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            !n.isRead
                              ? "font-semibold text-apple-900"
                              : "text-apple-500"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="mt-0.5 text-xs text-apple-400">
                          {formatTimestamp(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="secondary" onClick={handleLogoutClick}>
          Logout
        </Button>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        confirmClassName="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </header>
  );
}

export default observer(Header);
