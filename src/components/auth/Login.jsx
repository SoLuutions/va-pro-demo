import React, { useMemo, useState } from 'react';
import { loadFromStorage } from '../../utils/localStorage';
import { LogIn } from 'lucide-react';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('personal'); // 'personal' | 'organization'
  const [selectedOrg, setSelectedOrg] = useState('');

  const orgs = useMemo(() => {
    try { return loadFromStorage('va_pro_orgs', []); } catch { return []; }
  }, []);

  const memberships = useMemo(() => {
    try { return loadFromStorage('va_pro_memberships', []); } catch { return []; }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const preferredOrgId = mode === 'organization' && selectedOrg ? parseInt(selectedOrg) : undefined;
    const result = onLogin(email, password, preferredOrgId);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VA Pro</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3 mb-3">
              <label className="flex items-center space-x-2">
                <input type="radio" name="mode" checked={mode==='personal'} onChange={() => setMode('personal')} />
                <span className="text-sm text-gray-700">Personal</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="mode" checked={mode==='organization'} onChange={() => setMode('organization')} />
                <span className="text-sm text-gray-700">Organization</span>
              </label>
            </div>
            {mode === 'organization' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} (#{o.id})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Only organizations you belong to will be accessible after login.</p>
              </div>
            )}
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
