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
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
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
