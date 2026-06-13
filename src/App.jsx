import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VADemo from './components/VADemo.jsx';

// Possible views for unauthenticated users: 'landing' | 'login' | 'register'
function AppContent() {
  const { isAuthenticated, authLoading, login, register } = useAuth();
  const [view, setView] = useState('landing');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="va-bg" aria-hidden="true" />
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent relative z-10" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <VADemo />;
  }

  if (view === 'register') {
    return (
      <Register
        onRegister={register}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  if (view === 'login') {
    return (
      <Login
        onLogin={login}
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  // Default: landing page
  return (
    <LandingPage
      onGetStarted={() => setView('register')}
      onSignIn={() => setView('login')}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Analytics />
    </ErrorBoundary>
  );
}
