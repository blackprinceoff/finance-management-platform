import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../stores/authStore";
import Button from "./Button";

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

  const handleLogout = () => {
    authStore.logout();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between border-b border-apple-200 bg-white px-6 py-4">
      <span className="text-lg font-semibold text-apple-900">
        Finance Platform
      </span>
      <div className="flex items-center gap-4">
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
            className={`text-sm font-medium transition-colors ${
              currentPage === "admin"
                ? "text-apple-blue hover:text-apple-blue-hover"
                : "text-apple-500 hover:text-apple-900"
            }`}
          >
            Admin Panel
          </button>
        )}
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default observer(Header);
