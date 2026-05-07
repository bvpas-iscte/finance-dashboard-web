import { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export default function Savings() {
  const [goal, setGoal] = useState('');
  const [target, setTarget] = useState('');

  const transactions = useFinanceStore((s) => s.transactions);

  const income = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const expenses = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const savings = income - expenses;
  const progress = target ? (savings / target) * 100 : 0;

  return (
    <div className="card-elevated p-5 space-y-4">

      <h2 className="font-semibold">Savings</h2>

      <h1 className="text-3xl font-bold">
        €{savings.toFixed(2)}
      </h1>

      <div className="h-2 bg-white/10 rounded-full">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600"
          style={{ width: `${progress}%` }}
        />
      </div>

      <input
        placeholder="Goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <input
        placeholder="Target"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />

    </div>
  );
}