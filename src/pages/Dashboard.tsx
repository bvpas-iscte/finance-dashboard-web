import { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SavingsGoal } from '../store/useFinanceStore';

const CATEGORIES = [
  'food',
  'transport',
  'lasure',
  'utilities',
  'shopping',
  'other',
];

export default function Dashboard() {
  const transactions = useFinanceStore((s) => s.transactions);
  const balance = useFinanceStore((s) => s.getBalance());
  const savings = useFinanceStore((s) => s.savings) || [];

  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const addSavingsGoal = useFinanceStore((s) => s.addSavingsGoal);
  const deleteSavingsGoal = useFinanceStore((s) => s.deleteSavingsGoal);

  const addFundsToGoal = useFinanceStore((s) => s.addFundsToGoal);
  const updateGoalMonthly = useFinanceStore(
    (s) => s.updateGoalMonthly
  );

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(
    'expense'
  );

  const [category, setCategory] = useState('food');

  const [goal, setGoal] = useState('');
  const [target, setTarget] = useState('');

  const [goalFunds, setGoalFunds] = useState<
    Record<number, string>
  >({});

  const [goalMonthly, setGoalMonthly] = useState<
    Record<number, string>
  >({});

  const [fundError, setFundError] = useState<
    Record<number, string>
  >({});

  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const expenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const chartData = transactions.map((t, i) => ({
    index: i,
    amount:
      t.type === 'income' ? t.amount : -t.amount,
  }));

  const totalSavings = savings.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  const handleAddTransaction = () => {
    if (!amount) return;

    addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(),
    });

    setAmount('');
  };

  const handleAddSavingsGoal = () => {
    if (!goal || !target) return;

    addSavingsGoal({
      name: goal,
      target: parseFloat(target),
      amount: 0,
      monthlyContribution: 0,
    });

    setGoal('');
    setTarget('');
  };

  const handleAddFundsToGoal = (
    goalId: number,
    fundAmount: string
  ) => {
    if (
      !fundAmount ||
      parseFloat(fundAmount) <= 0
    )
      return;

    const amount = parseFloat(fundAmount);

    if (amount > balance) {
      setFundError({
        ...fundError,
        [goalId]: 'Insufficient balance',
      });

      return;
    }

    const success = addFundsToGoal(
      goalId,
      amount
    );

    if (success) {
      setGoalFunds({
        ...goalFunds,
        [goalId]: '',
      });

      setFundError({
        ...fundError,
        [goalId]: '',
      });
    }
  };

  const calculateMonthsToGoal = (
    goal: SavingsGoal
  ) => {
    if (
      !goal.monthlyContribution ||
      goal.monthlyContribution <= 0
    )
      return null;

    const remaining =
      goal.target - goal.amount;

    if (remaining <= 0) return 0;

    return Math.ceil(
      remaining / goal.monthlyContribution
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-12">
      {/* BALANCE CARD */}
      <div className="lg:col-span-4 card-elevated p-8 space-y-6">
        <p className="text-white/60 text-xs uppercase tracking-widest">
          Total balance
        </p>

        <h1 className="text-5xl font-bold">
          €{balance.toFixed(2)}
        </h1>

        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              Income
            </p>

            <p className="text-lg font-semibold">
              €{income.toFixed(2)}
            </p>
          </div>

          <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              Expenses
            </p>

            <p className="text-lg font-semibold">
              €{expenses.toFixed(2)}
            </p>
          </div>

          <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              Savings
            </p>

            <p className="text-lg font-semibold">
              €{totalSavings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="lg:col-span-2 card p-6">
        <h3 className="text-sm font-semibold mb-4">
          Activity
        </h3>

        <ResponsiveContainer
          width="100%"
          height={260}
        >
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="amount"
              stroke="url(#grad)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <svg width="0" height="0">
          <defs>
            <linearGradient
              id="grad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#a855f7"
              />

              <stop
                offset="100%"
                stopColor="#d946ef"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* NEW TRANSACTION */}
      <div className="card-elevated p-5 space-y-4">
        <h2 className="text-sm font-semibold">
          New Transaction
        </h2>

        <input
          type="number"
          placeholder="€0.00"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder-white/30 focus:ring-2 focus:ring-purple-500/40"
        />

        <div className="flex gap-2">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() =>
                setType(
                  t as 'income' | 'expense'
                )
              }
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide border transition ${
                type === t
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent shadow-lg'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition ${
                category === c
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-transparent text-white'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddTransaction}
          disabled={!amount}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add
        </button>
      </div>

      {/* SAVINGS GOALS */}
      <div className="card p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            Savings Goals
          </h3>

          <p className="text-xs text-white/40">
            Set a monthly amount to see when
            you'll reach your goal
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {savings.length > 0 ? (
            savings.map((s) => {
              const monthsRemaining =
                calculateMonthsToGoal(s);

              return (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 group hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-white/60">
                      {s.name}
                    </p>

                    <button
                      onClick={() =>
                        deleteSavingsGoal(s.id)
                      }
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-sm font-semibold">
                    €{s.amount.toFixed(2)} / €
                    {s.target.toFixed(2)}
                  </p>

                  <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (s.amount / s.target) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {monthsRemaining !== null && (
                    <p className="text-xs text-white/50 mt-2">
                      {monthsRemaining === 0
                        ? '✓ Goal achieved!'
                        : `${monthsRemaining} month${
                            monthsRemaining !== 1
                              ? 's'
                              : ''
                          } remaining`}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Add funds"
                        value={
                          goalFunds[s.id] || ''
                        }
                        onChange={(e) => {
                          setGoalFunds({
                            ...goalFunds,
                            [s.id]:
                              e.target.value,
                          });

                          setFundError({
                            ...fundError,
                            [s.id]: '',
                          });
                        }}
                        className="flex-1 px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white placeholder-white/30"
                      />

                      <button
                        onClick={() =>
                          handleAddFundsToGoal(
                            s.id,
                            goalFunds[s.id]
                          )
                        }
                        className="px-2 py-1 rounded text-xs bg-purple-600/50 hover:bg-purple-600 text-white transition"
                      >
                        Add
                      </button>
                    </div>

                    {fundError[s.id] && (
                      <p className="text-xs text-red-400">
                        {fundError[s.id]}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Monthly amount"
                        value={
                          goalMonthly[s.id] || ''
                        }
                        onChange={(e) => {
                          setGoalMonthly({
                            ...goalMonthly,
                            [s.id]:
                              e.target.value,
                          });

                          updateGoalMonthly(
                            s.id,
                            e.target.value
                          );
                        }}
                        className="flex-1 px-2 py-1 rounded text-xs bg-white/5 border border-white/10 text-white placeholder-white/30"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-white/40">
              No savings goals yet
            </p>
          )}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="lg:col-span-2 card p-6 space-y-4">
        <h3 className="text-sm font-semibold">
          Recent Transactions
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.length > 0 ? (
            transactions
              .slice(0, 10)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10 group hover:bg-white/10 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t.description ||
                        t.category}
                    </p>

                    <p className="text-xs text-white/60">
                      {new Date(
                        t.date || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        t.type === 'income'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {t.type === 'income'
                        ? '+'
                        : '-'}
                      €{t.amount.toFixed(2)}
                    </p>

                    <button
                      onClick={() =>
                        deleteTransaction(t.id)
                      }
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-xs text-white/40">
              No transactions yet
            </p>
          )}
        </div>
      </div>

      {/* NEW SAVINGS GOAL */}
      <div className="card-elevated p-5 space-y-4">
        <h2 className="text-sm font-semibold">
          New Goal
        </h2>

        <input
          placeholder="Goal name"
          value={goal}
          onChange={(e) =>
            setGoal(e.target.value)
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        />

        <input
          type="number"
          placeholder="Target amount"
          value={target}
          onChange={(e) =>
            setTarget(e.target.value)
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
        />

        <button
          onClick={handleAddSavingsGoal}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-sm font-semibold"
        >
          Create Goal
        </button>
      </div>
    </div>
  );
}