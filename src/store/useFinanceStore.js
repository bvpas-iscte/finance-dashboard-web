import { create } from 'zustand';

const loadFromStorage = () => {
  const data = localStorage.getItem('finance-data');
  return data ? JSON.parse(data) : { transactions: [], savings: [], goal: 0 };
};

export const useFinanceStore = create((set, get) => ({
  ...loadFromStorage(),

  save: (data) => {
    localStorage.setItem('finance-data', JSON.stringify(data));
  },

  addTransaction: (tx) => {
    const updated = {
      ...get(),
      transactions: [...get().transactions, { id: Date.now(), ...tx }],
    };
    get().save(updated);
    set(updated);
  },

  deleteTransaction: (id) => {
    const transaction = get().transactions.find((t) => t.id === id);
    
    let updated = {
      ...get(),
      transactions: get().transactions.filter((t) => t.id !== id),
    };

    // If deleting a savings transaction, remove funds from the corresponding goal
    if (transaction && transaction.category === 'savings') {
      // Find the goal that was being funded (assuming it's the most recent one or match by amount)
      const savingsGoals = get().savings || [];
      if (savingsGoals.length > 0) {
        const lastGoal = savingsGoals[savingsGoals.length - 1];
        if (lastGoal.amount >= transaction.amount) {
          updated.savings = savingsGoals.map((s) =>
            s.id === lastGoal.id ? { ...s, amount: Math.max(0, s.amount - transaction.amount) } : s
          );
        }
      }
    }

    get().save(updated);
    set(updated);
  },

  addSavingsGoal: (savingsGoal) => {
    const updated = {
      ...get(),
      savings: [...(get().savings || []), { id: Date.now(), ...savingsGoal }],
    };
    get().save(updated);
    set(updated);
  },

  deleteSavingsGoal: (id) => {
    const updated = {
      ...get(),
      savings: (get().savings || []).filter((s) => s.id !== id),
    };
    get().save(updated);
    set(updated);
  },

  addFundsToGoal: (goalId, amount) => {
    const balance = get().getBalance();
    if (amount > balance) return false;

    const updated = {
      ...get(),
      transactions: [
        ...get().transactions,
        { id: Date.now(), amount, type: 'expense', category: 'savings', goalId, date: new Date() },
      ],
      savings: (get().savings || []).map((s) =>
        s.id === goalId ? { ...s, amount: s.amount + amount } : s
      ),
    };
    get().save(updated);
    set(updated);
    return true;
  },

  updateGoalMonthly: (goalId, monthlyAmount) => {
    const updated = {
      ...get(),
      savings: (get().savings || []).map((s) =>
        s.id === goalId ? { ...s, monthlyContribution: parseFloat(monthlyAmount) || 0 } : s
      ),
    };
    get().save(updated);
    set(updated);
  },

  setGoal: (goal) => {
    const updated = { ...get(), goal };
    get().save(updated);
    set(updated);
  },

  getBalance: () => {
    return get().transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  },
}));