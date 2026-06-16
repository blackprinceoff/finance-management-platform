import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import authStore from "../stores/authStore";
import Button from "../components/Button";

function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    financeStore.fetchDashboardData(now.getMonth() + 1, now.getFullYear());
  }, []);

  const handleLogout = () => {
    authStore.logout();
    navigate("/auth");
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const {
    dashboardSummary,
    budgetProgressList,
    isLoading,
    error,
  } = financeStore;

  const balanceColor =
    dashboardSummary && dashboardSummary.currentBalance >= 0
      ? "text-green-600"
      : "text-red-500";

  return (
    <div className="min-h-screen bg-apple-50">
      <header className="flex items-center justify-between border-b border-apple-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-apple-900">
          Finance Platform
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue-hover"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/transactions")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
          >
            Transactions
          </button>
          <button
            onClick={() => navigate("/budgets")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
          >
            Budgets
          </button>
          <button
            onClick={() => navigate("/goals")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
          >
            Goals
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
          >
            Categories
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading && !dashboardSummary ? (
          <div className="py-20 text-center text-sm text-apple-400">
            Loading...
          </div>
        ) : dashboardSummary ? (
          <>
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-apple-400">
                  Total Income
                </p>
                <p className="mt-2 text-3xl font-semibold text-green-600">
                  {formatCurrency(dashboardSummary.totalIncome)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-apple-400">
                  Total Expense
                </p>
                <p className="mt-2 text-3xl font-semibold text-red-500">
                  {formatCurrency(dashboardSummary.totalExpense)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-apple-400">
                  Current Balance
                </p>
                <p className={`mt-2 text-3xl font-semibold ${balanceColor}`}>
                  {formatCurrency(dashboardSummary.currentBalance)}
                </p>
              </div>
            </section>

            <section className="mt-8 rounded-2xl bg-white shadow-sm">
              <div className="border-b border-apple-100 px-6 py-4">
                <h2 className="text-base font-semibold text-apple-900">
                  Budget Progress
                </h2>
              </div>

              {budgetProgressList.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-apple-400">
                  No budgets set for this period.
                </div>
              ) : (
                <ul className="divide-y divide-apple-100">
                  {budgetProgressList.map((b, index) => {
                    const percentage =
                      b.budgetAmount > 0
                        ? Math.min((b.spentAmount / b.budgetAmount) * 100, 100)
                        : 0;

                    return (
                      <li
                        key={index}
                        className={`px-6 py-5 transition-colors ${
                          b.isExceeded ? "bg-red-50" : "hover:bg-apple-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-apple-900">
                              {b.categoryName}
                            </span>
                            {b.isExceeded && (
                              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                                Exceeded!
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              b.isExceeded
                                ? "text-red-600"
                                : "text-apple-500"
                            }`}
                          >
                            {formatCurrency(b.spentAmount)} of{" "}
                            {formatCurrency(b.budgetAmount)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-apple-100">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              b.isExceeded
                                ? "bg-red-500"
                                : "bg-apple-blue"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default observer(DashboardPage);
