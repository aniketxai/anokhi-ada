import { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { getBaseUrl } from '../api';

export function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid password');
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      onLogin();
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Lock size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-secondary-text">Enter your password to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-lg border border-white/8 bg-white/5 text-foreground placeholder-secondary-text outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-6"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-secondary-text mt-6">
          Secure admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

export function AdminLogoutButton({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/10 transition-material"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
