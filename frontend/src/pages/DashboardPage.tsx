import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../stores/authStore";
import Button from "../components/Button";

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <header className="flex items-center justify-between border-b border-apple-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-apple-900">
          Finance Platform
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/transactions")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
          >
            Transactions
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue-hover"
          >
            Categories
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-16 max-w-2xl px-4">
        <div className="rounded-apple bg-white px-8 py-12 shadow-sm">
          <p className="text-center text-apple-500">
            Welcome to your Dashboard. Financial charts will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default observer(DashboardPage);
