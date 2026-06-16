import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import authStore from "../stores/authStore";
import Button from "../components/Button";
import Input from "../components/Input";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface FormState {
  amount: string;
  month: string;
  year: string;
  categoryId: string;
}

function emptyForm(): FormState {
  return {
    amount: "",
    month: "",
    year: String(new Date().getFullYear()),
    categoryId: "",
  };
}

function BudgetsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    financeStore.fetchBudgets();
    financeStore.fetchCategories();
  }, []);

  const sortedBudgets = [...financeStore.budgets].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.month || !form.year || !form.categoryId) return;

    setSubmitting(true);
    try {
      const success = await financeStore.createBudget({
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
        categoryId: Number(form.categoryId),
      });

      if (success) {
        setForm(emptyForm());
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await financeStore.deleteBudget(id);
  };

  const handleLogout = () => {
    authStore.logout();
    navigate("/auth");
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatMonthYear = (month: number, year: number) =>
    `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="min-h-screen bg-apple-50">
      <header className="flex items-center justify-between border-b border-apple-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-apple-900">
          Finance Platform
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-apple-500 transition-colors hover:text-apple-900"
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
            className="text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue-hover"
          >
            Budgets
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
        {financeStore.error && (
          <div className="rounded-xl bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">{financeStore.error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-apple-900">
            Add Budget
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => handleFormChange("amount", e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-apple-700">
                Month
              </label>
              <select
                value={form.month}
                onChange={(e) => handleFormChange("month", e.target.value)}
                required
                className="w-full rounded-apple border border-apple-200 bg-white px-4 py-3 text-sm text-apple-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                <option value="">Select...</option>
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Year"
              type="number"
              min="2000"
              max="2100"
              placeholder="2026"
              value={form.year}
              onChange={(e) => handleFormChange("year", e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-apple-700">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => handleFormChange("categoryId", e.target.value)}
                required
                className="w-full rounded-apple border border-apple-200 bg-white px-4 py-3 text-sm text-apple-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                <option value="">Select...</option>
                {financeStore.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              Add Budget
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">
              Budgets
            </h2>
          </div>

          {financeStore.isLoading && sortedBudgets.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : sortedBudgets.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No budgets yet.
            </div>
          ) : (
            <ul className="divide-y divide-apple-100">
              {sortedBudgets.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-apple-50"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-apple-900">
                        {b.categoryName}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-400">
                        {formatMonthYear(b.month, b.year)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-apple-900">
                      {formatCurrency(b.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete budget"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default observer(BudgetsPage);
