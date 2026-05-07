import { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

const CATEGORIES = [
  'food','transport','entertainment',
  'utilities','shopping','other'
];

export default function AddTransaction() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');

  const addTransaction = useFinanceStore((s) => s.addTransaction);

  const handleAdd = () => {
    if (!amount) return;

    addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(),
    });

    setAmount('');
  };

  return (
    <div className="card-elevated p-5 space-y-5">

      <h2 className="text-lg font-semibold">New transaction</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-xl font-semibold"
      />

      <div className="flex gap-2">
        {['expense','income'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-xl ${
              type === t
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                : 'bg-white/5 text-white/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs border ${
              category === c
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-transparent text-white'
                : 'border-white/10 text-white/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 font-semibold"
      >
        Add transaction
      </button>

    </div>
  );
}