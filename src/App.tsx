import { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('ThemeContext not found');
  }

  const { isDark, toggleTheme } = theme;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${isDark
              ? 'from-purple-200 to-white'
              : 'from-purple-950 to-black'
            } bg-clip-text text-transparent leading-tight`}>
            Manage Your Money
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/90' : 'text-white/90'}`}>
            Track income, expenses, and achieve your savings goals
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-lg transition-all flex-shrink-0 ${isDark
              ? 'bg-white/10 hover:bg-white/20 text-purple-400'
              : 'bg-purple-200 hover:bg-purple-300 text-purple-900'
            }`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      <Dashboard />
    </div>
  );
}