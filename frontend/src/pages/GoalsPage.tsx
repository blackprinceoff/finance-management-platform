import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import financeStore from "../stores/financeStore";
import Header from "../components/Header";
import Button from "../components/Button";
import Input from "../components/Input";
import { formatCurrency, formatDate } from "../utils/formatUtils";

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
    deadline: new Date().toISOString().split("T")[0],
  };
}

function GoalsPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

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
      if (editingGoalId) {
        success = await financeStore.updateGoal(editingGoalId, payload);
      } else {
        success = await financeStore.createGoal(payload);
      }

      if (success) {
        setForm(emptyForm());
        setEditingGoalId(null);
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

  const handleDelete = async (id: number) => {
    await financeStore.deleteGoal(id);
  };



  return (
    <div className="min-h-screen bg-apple-50">
      <Header currentPage="goals" />

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
            {editingGoalId ? "Edit Goal" : "Add Goal"}
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
            <Input
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => handleFormChange("deadline", e.target.value)}
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {editingGoalId && (
              <Button type="button" onClick={handleCancelEdit} variant="secondary">
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={submitting}>
              {editingGoalId ? "Update Goal" : "Add Goal"}
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
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        className="rounded-full p-2 text-apple-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete goal"
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default observer(GoalsPage);
