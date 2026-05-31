import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VADemo from './components/VADemo.jsx';

function AppContent() {
  const { isAuthenticated, authLoading, login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="va-bg" aria-hidden="true" />
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent relative z-10" />
      </div>
    );
  }

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

  return <VADemo />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
