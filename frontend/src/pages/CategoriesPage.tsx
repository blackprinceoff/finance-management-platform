import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import authStore from "../stores/authStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import type { CategoryType } from "../types/finance";

interface FormState {
  name: string;
  type: CategoryType;
  isGlobal: boolean;
}

function emptyForm(): FormState {
  return {
    name: "",
    type: "EXPENSE",
    isGlobal: false,
  };
}

function CategoriesPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    financeStore.fetchCategories();
  }, []);

  const handleFormChange = (
    field: keyof FormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    try {
      const success = await financeStore.createCategory({
        name: form.name.trim(),
        type: form.type,
        isGlobal: form.isGlobal,
      });

      if (success) {
        setForm(emptyForm());
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await financeStore.deleteCategory(id);
  };

  const typeBadge = (type: CategoryType) => {
    const isIncome = type === "INCOME";
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isIncome
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="categories" />

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
            Add Category
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              type="text"
              placeholder="e.g. Groceries"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-apple-700">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  handleFormChange("type", e.target.value as CategoryType)
                }
                className="w-full rounded-apple border border-apple-200 bg-white px-4 py-3 text-sm text-apple-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                <option value="EXPENSE">EXPENSE</option>
                <option value="INCOME">INCOME</option>
              </select>
            </div>
          </div>

          {authStore.isAdmin && (
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isGlobal}
                onChange={(e) =>
                  handleFormChange("isGlobal", e.target.checked)
                }
                className="h-4 w-4 rounded border-apple-300 text-apple-blue focus:ring-apple-blue"
              />
              <span className="text-sm text-apple-700">
                Create as Global Category
              </span>
            </label>
          )}

          <div className="mt-4 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              Add Category
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">
              Categories
            </h2>
          </div>

          {financeStore.categoriesLoading && financeStore.categories.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : financeStore.categories.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No categories yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {financeStore.categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-apple-100 p-4 transition-colors hover:bg-apple-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-apple-900">
                      {c.name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {typeBadge(c.type)}
                      {c.isGlobal && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Global
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete category"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default observer(CategoriesPage);
