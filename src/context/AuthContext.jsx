import React, { createContext, useState, useContext, useEffect } from 'react';
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from '../utils/localStorage';

const AuthContext = createContext(null);

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.AUTH_USER, null));

  // Derived — no separate state needed
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [user]);

  const login = async (email, password) => {
    const hashed = await hashPassword(password);
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    // Support both hashed and legacy plaintext passwords
    const existingUser = users.find(
      u => u.email === email && (u.password === hashed || u.password === password)
    );
    if (existingUser) {
      // Silently migrate plaintext password to hashed on next login
      if (existingUser.password === password) {
        const migrated = users.map(u =>
          u.email === email ? { ...u, password: hashed } : u
        );
        saveToStorage(STORAGE_KEYS.REGISTERED_USERS, migrated);
      }
      setUser({ email: existingUser.email, name: existingUser.name });
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (name, email, password) => {
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const hashed = await hashPassword(password);
    const newUser = { name, email, password: hashed };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.REGISTERED_USERS, users);
    setUser({ email, name });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
