import React, { createContext, useState, useContext, useEffect } from 'react';
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from '../utils/localStorage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.AUTH_USER, null));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!loadFromStorage(STORAGE_KEYS.AUTH_USER, null));

  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (email, password) => {
    const existingUser = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []).find(
      u => u.email === email && u.password === password
    );
    
    if (existingUser) {
      setUser({ email: existingUser.email, name: existingUser.name });
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password) => {
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.REGISTERED_USERS, users);
    
    setUser({ email, name });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
