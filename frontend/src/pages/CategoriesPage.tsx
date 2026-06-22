import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import authStore from "../stores/authStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import type { CategoryType } from "../types/finance";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { TrashIcon } from "../components/Icons";

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
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    financeStore.fetchCategories();
  }, []);

  const expenseCategories = financeStore.categories.filter(
    (c) => c.type === "EXPENSE",
  );

  const incomeCategories = financeStore.categories.filter(
    (c) => c.type === "INCOME",
  );

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
        toast.success("Category created successfully");
      } else {
        toast.error(financeStore.error || "Failed to create category");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete === null) return;
    const success = await financeStore.deleteCategory(categoryToDelete);
    if (success) {
      toast.success("Category deleted");
    }
    setCategoryToDelete(null);
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
        {type.charAt(0) + type.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="categories" />

      <main className="mx-auto max-w-5xl px-4 py-8">
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
                className="w-full rounded-apple border border-apple-200 px-4 py-3 text-sm text-apple-900 focus:border-apple-400 focus:outline-none focus:ring-2 focus:ring-apple-blue bg-transparent cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
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

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-apple-100 px-6 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <h2 className="text-base font-semibold text-apple-900">
                Expense Categories
              </h2>
            </div>

            {financeStore.categoriesLoading && expenseCategories.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-apple-400">
                Loading...
              </div>
            ) : expenseCategories.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-apple-400">
                No expense categories yet.
              </div>
            ) : (
              <div className="divide-y divide-apple-100">
                {expenseCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-apple-50 even:bg-apple-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-apple-900">
                        {c.name}
                      </p>
                      {c.isGlobal && (
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Global
                        </span>
                      )}
                    </div>
                    {!c.isGlobal && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(c.id)}
                        className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-apple-100 px-6 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <h2 className="text-base font-semibold text-apple-900">
                Income Categories
              </h2>
            </div>

            {financeStore.categoriesLoading && incomeCategories.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-apple-400">
                Loading...
              </div>
            ) : incomeCategories.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-apple-400">
                No income categories yet.
              </div>
            ) : (
              <div className="divide-y divide-apple-100">
                {incomeCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-apple-50 even:bg-apple-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-apple-900">
                        {c.name}
                      </p>
                      {c.isGlobal && (
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Global
                        </span>
                      )}
                    </div>
                    {!c.isGlobal && (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(c.id)}
                        className="ml-4 rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}

export default observer(CategoriesPage);
