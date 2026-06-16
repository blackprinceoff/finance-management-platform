import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import authStore from "../stores/authStore";
import Button from "../components/Button";
import Input from "../components/Input";

type Tab = "expense" | "income";

interface FormState {
  amount: string;
  description: string;
  date: string;
  categoryId: string;
}

function emptyForm(): FormState {
  return {
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  };
}

function TransactionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("expense");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    financeStore.fetchCategories();
    financeStore.fetchExpenses();
    financeStore.fetchIncomes();
  }, []);

  const filteredCategories = financeStore.categories.filter(
    (c) => c.type === (activeTab === "expense" ? "EXPENSE" : "INCOME"),
  );

  const totalExpenses = financeStore.expenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  const totalIncomes = financeStore.incomes.reduce(
    (sum, i) => sum + i.amount,
    0,
  );

  const transactions =
    activeTab === "expense" ? financeStore.expenses : financeStore.incomes;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.date || !form.categoryId) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: Number(form.amount),
        description: form.description || undefined,
        date: form.date,
        categoryId: Number(form.categoryId),
      };

      const success =
        activeTab === "expense"
          ? await financeStore.createExpense(payload)
          : await financeStore.createIncome(payload);

      if (success) {
        setForm(emptyForm());
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (activeTab === "expense") {
      await financeStore.deleteExpense(id);
    } else {
      await financeStore.deleteIncome(id);
    }
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
            className="text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue-hover"
          >
            Transactions
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-apple-500">
              Total Expenses
            </p>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-apple-500">Total Incomes</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {formatCurrency(totalIncomes)}
            </p>
          </div>
        </div>

        {financeStore.error && (
          <div className="mt-6 rounded-xl bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">{financeStore.error}</p>
          </div>
        )}

        <div className="mt-8 flex w-fit items-center gap-2 rounded-full bg-apple-100 p-1">
          <button
            onClick={() => setActiveTab("expense")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeTab === "expense"
                ? "bg-white text-apple-900 shadow-sm"
                : "text-apple-500 hover:text-apple-900"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeTab === "income"
                ? "bg-white text-apple-900 shadow-sm"
                : "text-apple-500 hover:text-apple-900"
            }`}
          >
            Incomes
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-apple-900">
            Add {activeTab === "expense" ? "Expense" : "Income"}
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
            <Input
              label="Description"
              type="text"
              placeholder="Optional"
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
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
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              Add {activeTab === "expense" ? "Expense" : "Income"}
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">
              {activeTab === "expense" ? "Expenses" : "Incomes"}
            </h2>
          </div>

          {financeStore.isLoading && sortedTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No {activeTab === "expense" ? "expenses" : "incomes"} yet.
            </div>
          ) : (
            <ul className="divide-y divide-apple-100">
              {sortedTransactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-apple-50"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-apple-900">
                        {t.description || "No description"}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-400">
                        {formatDate(t.date)} &middot; {t.categoryName}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold ${
                        activeTab === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {activeTab === "expense" ? "-" : "+"}
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete"
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

export default observer(TransactionsPage);
