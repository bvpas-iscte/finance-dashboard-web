import { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export default function Savings() {
  const [goal, setGoal] = useState('');
  const [target, setTarget] = useState('');

  const transactions = useFinanceStore((s) => s.transactions);

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

  const savings = income - expenses;
  const progress = target ? Math.min((savings / Number(target)) * 100, 100) : 0;

  return (
    <div className="bg-black border border-white/10 rounded-3xl backdrop-blur-xl p-5 space-y-4">
      <h2 className="font-semibold">Savings</h2>
      <h1 className="text-3xl font-bold">€{savings.toFixed(2)}</h1>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <input
        placeholder="Goal name"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 text-sm"
      />
      <input
        type="number"
        placeholder="Target amount (€)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 text-sm"
      />
    </div>
  );
}
