import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

// In a real application, this would be handled by a secure auth system.
const ADMIN_PASSWORD = 'password123';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-base-200 dark:bg-slate-800 p-10 rounded-xl shadow-lg border border-base-300/50 dark:border-slate-700/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary dark:text-slate-50">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary dark:text-slate-400">
            Please enter the password to manage inventory.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-base-300 bg-base-100 dark:border-slate-600 dark:bg-slate-700 text-text-primary dark:text-slate-50 placeholder-text-secondary dark:placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-gradient from-brand-primary to-brand-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-opacity"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};