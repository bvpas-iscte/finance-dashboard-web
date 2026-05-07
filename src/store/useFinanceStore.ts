import { create } from 'zustand';

type Transaction = {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  goalId?: number;
  date?: Date;
};

type SavingsGoal = {
  id: number;
  amount: number;
  monthlyContribution?: number;
};

type FinanceState = {
  transactions: Transaction[];
  savings: SavingsGoal[];
  goal: number;

  save: (data: FinanceState) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;

  deleteTransaction: (id: number) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;

  deleteSavingsGoal: (id: number) => void;

  addFundsToGoal: (goalId: number, amount: number) => boolean;

  updateGoalMonthly: (
    goalId: number,
    monthlyAmount: string
  ) => void;

  setGoal: (goal: number) => void;

  getBalance: () => number;
};

const loadFromStorage = (): Pick<
  FinanceState,
  'transactions' | 'savings' | 'goal'
> => {
  const data = localStorage.getItem('finance-data');

  return data
    ? JSON.parse(data)
    : {
        transactions: [],
        savings: [],
        goal: 0,
      };
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  ...loadFromStorage(),

  save: (data: FinanceState) => {
    localStorage.setItem('finance-data', JSON.stringify(data));
  },

  addTransaction: (tx: Omit<Transaction, 'id'>) => {
    const updated: FinanceState = {
      ...get(),
      transactions: [
        ...get().transactions,
        { id: Date.now(), ...tx },
      ],
    };

    get().save(updated);
    set(updated);
  },

  deleteTransaction: (id: number) => {
    const transaction = get().transactions.find(
      (t: Transaction) => t.id === id
    );

    const updated: FinanceState = {
      ...get(),
      transactions: get().transactions.filter(
        (t: Transaction) => t.id !== id
      ),
      savings: [...get().savings],
      goal: get().goal,
    };

    if (transaction && transaction.category === 'savings') {
      const savingsGoals = get().savings || [];

      if (savingsGoals.length > 0) {
        const lastGoal = savingsGoals[savingsGoals.length - 1];

        if (lastGoal.amount >= transaction.amount) {
          updated.savings = savingsGoals.map((s: SavingsGoal) =>
            s.id === lastGoal.id
              ? {
                  ...s,
                  amount: Math.max(
                    0,
                    s.amount - transaction.amount
                  ),
                }
              : s
          );
        }
      }
    }

    get().save(updated);
    set(updated);
  },

  addSavingsGoal: (
    savingsGoal: Omit<SavingsGoal, 'id'>
  ) => {
    const updated: FinanceState = {
      ...get(),
      savings: [
        ...(get().savings || []),
        { id: Date.now(), ...savingsGoal },
      ],
    };

    get().save(updated);
    set(updated);
  },

  deleteSavingsGoal: (id: number) => {
    const updated: FinanceState = {
      ...get(),
      savings: (get().savings || []).filter(
        (s: SavingsGoal) => s.id !== id
      ),
    };

    get().save(updated);
    set(updated);
  },

  addFundsToGoal: (
    goalId: number,
    amount: number
  ) => {
    const balance = get().getBalance();

    if (amount > balance) return false;

    const updated: FinanceState = {
      ...get(),

      transactions: [
        ...get().transactions,
        {
          id: Date.now(),
          amount,
          type: 'expense',
          category: 'savings',
          goalId,
          date: new Date(),
        },
      ],

      savings: (get().savings || []).map(
        (s: SavingsGoal) =>
          s.id === goalId
            ? {
                ...s,
                amount: s.amount + amount,
              }
            : s
      ),
    };

    get().save(updated);
    set(updated);

    return true;
  },

  updateGoalMonthly: (
    goalId: number,
    monthlyAmount: string
  ) => {
    const updated: FinanceState = {
      ...get(),

      savings: (get().savings || []).map(
        (s: SavingsGoal) =>
          s.id === goalId
            ? {
                ...s,
                monthlyContribution:
                  parseFloat(monthlyAmount) || 0,
              }
            : s
      ),
    };

    get().save(updated);
    set(updated);
  },

  setGoal: (goal: number) => {
    const updated: FinanceState = {
      ...get(),
      goal,
    };

    get().save(updated);
    set(updated);
  },

  getBalance: () => {
    return get().transactions.reduce(
      (acc: number, t: Transaction) => {
        return t.type === 'income'
          ? acc + t.amount
          : acc - t.amount;
      },
      0
    );
  },
}));