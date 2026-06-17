import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { formatCurrency } from "../utils/formatUtils";
import { toast } from "react-hot-toast";
import Select from "../components/Select";
import ErrorBanner from "../components/ErrorBanner";
import ConfirmModal from "../components/ConfirmModal";
import { TrashIcon } from "../components/Icons";

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
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);

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
        toast.success("Budget added successfully");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (budgetToDelete === null) return;
    await financeStore.deleteBudget(budgetToDelete);
    setBudgetToDelete(null);
    toast.success("Budget deleted");
  };

  const formatMonthYear = (month: number, year: number) =>
    `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="budgets" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <ErrorBanner message={financeStore.error} />

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
            <Select
              label="Month"
              value={form.month}
              onChange={(e) => handleFormChange("month", e.target.value)}
              required
              options={MONTH_NAMES.map((name, i) => ({
                value: String(i + 1),
                label: name,
              }))}
            />
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
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => handleFormChange("categoryId", e.target.value)}
              required
              options={financeStore.categories
                .filter((c) => c.type === "EXPENSE")
                .map((c) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
            />
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

          {financeStore.budgetsLoading && sortedBudgets.length === 0 ? (
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
                    onClick={() => setBudgetToDelete(b.id)}
                    className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete budget"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={budgetToDelete !== null}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
}

export default observer(BudgetsPage);
