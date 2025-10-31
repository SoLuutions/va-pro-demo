import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VADemo from './components/VADemo.jsx';

function AppContent() {
  const { isAuthenticated, login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

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
