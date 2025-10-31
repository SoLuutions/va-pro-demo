import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VADemo from './components/VADemo.jsx';
import Landing from './components/Landing.jsx';

function AppContent() {
  const { isAuthenticated, login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  if (!isAuthenticated) {
    if (showLanding) {
      return (
        <Landing
          onGetStarted={() => setShowLanding(false)}
          onGoToLogin={() => setShowLanding(false)}
          onGoToRegister={() => { setShowLanding(false); setShowRegister(true); }}
        />
      );
    }
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
