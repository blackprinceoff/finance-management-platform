import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { formatCurrency, formatDate } from "../utils/formatUtils";
import { toast } from "react-hot-toast";
import Select from "../components/Select";
import ErrorBanner from "../components/ErrorBanner";
import ConfirmModal from "../components/ConfirmModal";
import { TrashIcon } from "../components/Icons";
import DatePicker from "react-datepicker";

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
  const [activeTab, setActiveTab] = useState<Tab>("expense");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

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
        toast.success(`Successfully added ${activeTab}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (transactionToDelete === null) return;
    
    if (activeTab === "expense") {
      await financeStore.deleteExpense(transactionToDelete);
    } else {
      await financeStore.deleteIncome(transactionToDelete);
    }
    setTransactionToDelete(null);
    toast.success("Transaction deleted");
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="transactions" />

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

        <ErrorBanner message={financeStore.error} />

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
            <div className="space-y-1">
              <label className="text-sm font-medium text-apple-700">Date</label>
              <DatePicker
                selected={form.date ? new Date(form.date) : new Date()}
                onChange={(date) => setForm((prev) => ({ ...prev, date: date ? date.toISOString().split("T")[0] : "" }))}
                dateFormat="MMM d, yyyy"
                showMonthDropdown={true}
                showYearDropdown={true}
                dropdownMode="select"
                className="w-full rounded-apple border px-4 py-3 text-sm text-apple-900 placeholder-apple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue bg-transparent cursor-pointer"
              />
            </div>
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => handleFormChange("categoryId", e.target.value)}
              required
              options={filteredCategories.map((c) => ({
                value: c.id.toString(),
                label: c.name,
              }))}
            />
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

          {(activeTab === "expense" ? financeStore.expensesLoading : financeStore.incomesLoading) && sortedTransactions.length === 0 ? (
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
                        {t.categoryName}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-400">
                        {t.description && t.description !== "No description"
                          ? `${formatDate(t.date)} • ${t.description}`
                          : formatDate(t.date)}
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
                    onClick={() => setTransactionToDelete(t.id)}
                    className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete"
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
        isOpen={transactionToDelete !== null}
        title={`Delete ${activeTab === "expense" ? "Expense" : "Income"}`}
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setTransactionToDelete(null)}
      />
    </div>
  );
}

export default observer(TransactionsPage);
