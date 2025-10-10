import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VADemo from './components/VADemo.jsx';
import { useEffect } from 'react';

function AppContent() {
  const { isAuthenticated, login, register, getUserMemberships, switchWorkspace } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [pendingWorkspaceSelect, setPendingWorkspaceSelect] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const m = getUserMemberships();
      if (m.length > 1) {
        setPendingWorkspaceSelect(m);
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={register}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={login}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  if (pendingWorkspaceSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-3">Select a workspace</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">You belong to multiple organizations. Choose one to continue.</p>
          <div className="space-y-2">
            {pendingWorkspaceSelect.map((m) => (
              <button
                key={`${m.orgId}-${m.role}`}
                onClick={() => { switchWorkspace(m.orgId); setPendingWorkspaceSelect(null); }}
                className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Org #{m.orgId} • Role: {m.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <VADemo />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
