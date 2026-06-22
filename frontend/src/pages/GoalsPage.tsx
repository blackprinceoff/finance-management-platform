import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { formatCurrency, formatDate, formatLocalDate, parseLocalDate } from "../utils/formatUtils";
import { toast } from "react-hot-toast";
import ErrorBanner from "../components/ErrorBanner";
import ConfirmModal from "../components/ConfirmModal";
import { TrashIcon, EditIcon } from "../components/Icons";
import DatePicker from "react-datepicker";

interface FormState {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
}

function emptyForm(): FormState {
  return {
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: formatLocalDate(new Date()),
  };
}

function GoalsPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  useEffect(() => {
    financeStore.fetchGoals();
  }, []);

  const sortedGoals = [...financeStore.goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount || !form.deadline) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
        deadline: form.deadline,
      };

      let success;
      if (editingGoalId !== null) {
        success = await financeStore.updateGoal(editingGoalId, payload);
      } else {
        success = await financeStore.createGoal(payload);
      }

      if (success) {
        setForm(emptyForm());
        setEditingGoalId(null);
        toast.success(editingGoalId !== null ? "Goal updated" : "Goal added");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (goal: typeof financeStore.goals[0]) => {
    setEditingGoalId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      deadline: goal.deadline,
    });
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setForm(emptyForm());
  };

  const confirmDelete = async () => {
    if (goalToDelete === null) return;
    await financeStore.deleteGoal(goalToDelete);
    setGoalToDelete(null);
    toast.success("Goal deleted");
  };

  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="goals" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <ErrorBanner message={financeStore.error} />

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-apple-900">
            {editingGoalId !== null ? "Edit Goal" : "Add Goal"}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Name"
              type="text"
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.targetAmount}
              onChange={(e) => handleFormChange("targetAmount", e.target.value)}
              required
            />
            <Input
              label="Current Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.currentAmount}
              onChange={(e) => handleFormChange("currentAmount", e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-apple-700">Deadline</label>
              <DatePicker
                selected={form.deadline ? parseLocalDate(form.deadline) : new Date()}
                onChange={(date) => setForm((prev) => ({ ...prev, deadline: date ? formatLocalDate(date) : "" }))}
                dateFormat="MMM d, yyyy"
                showMonthDropdown={true}
                showYearDropdown={true}
                dropdownMode="select"
                className="w-full rounded-apple border px-4 py-3 text-sm text-apple-900 placeholder-apple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-apple-blue bg-transparent cursor-pointer"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {editingGoalId !== null && (
              <Button type="button" onClick={handleCancelEdit} variant="secondary">
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={submitting}>
              {editingGoalId !== null ? "Update Goal" : "Add Goal"}
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl bg-white shadow-sm">
          <div className="border-b border-apple-100 px-6 py-4">
            <h2 className="text-base font-semibold text-apple-900">Goals</h2>
          </div>

          {financeStore.goalsLoading && sortedGoals.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              Loading...
            </div>
          ) : sortedGoals.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-apple-400">
              No goals yet.
            </div>
          ) : (
            <ul className="divide-y divide-apple-100">
              {sortedGoals.map((g) => {
                const progress = Math.min(
                  (g.currentAmount / g.targetAmount) * 100,
                  100,
                );
                const barColor =
                  progress < 25
                    ? "bg-red-500"
                    : progress < 50
                      ? "bg-orange-500"
                      : progress < 75
                        ? "bg-apple-blue"
                        : "bg-green-500";

                return (
                  <li
                    key={g.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-apple-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-apple-900">
                        {g.name}
                      </p>
                      <p className="mt-0.5 text-xs text-apple-400">
                        Due {formatDate(g.deadline)}
                      </p>
                      <p className="mt-1 text-xs text-apple-500">
                        {formatCurrency(g.currentAmount)} /{" "}
                        {formatCurrency(g.targetAmount)}
                      </p>
                      <div className="mt-2 h-2 w-full max-w-xs rounded-full bg-apple-100">
                        <div
                          className={`h-2 rounded-full transition-all ${barColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-apple-400">
                        {Math.round(progress)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(g)}
                        className="rounded-full p-2 text-apple-300 transition-colors hover:bg-apple-100 hover:text-apple-600"
                        aria-label="Edit goal"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalToDelete(g.id)}
                        className="rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete goal"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={goalToDelete !== null}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
}

export default observer(GoalsPage);
