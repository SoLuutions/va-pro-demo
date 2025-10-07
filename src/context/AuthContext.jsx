import React, { createContext, useState, useContext, useEffect } from 'react';
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from '../utils/localStorage';

const ORG_STORAGE_KEY = 'va_pro_orgs';
const MEMBERSHIP_STORAGE_KEY = 'va_pro_memberships';
const CURRENT_WORKSPACE_KEY = 'va_pro_current_workspace';

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
  const [orgs, setOrgs] = useState(() => loadFromStorage(ORG_STORAGE_KEY, []));
  const [memberships, setMemberships] = useState(() => loadFromStorage(MEMBERSHIP_STORAGE_KEY, []));
  const [currentWorkspace, setCurrentWorkspace] = useState(() => loadFromStorage(CURRENT_WORKSPACE_KEY, null));

  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    saveToStorage(ORG_STORAGE_KEY, orgs);
  }, [orgs]);

  useEffect(() => {
    saveToStorage(MEMBERSHIP_STORAGE_KEY, memberships);
  }, [memberships]);

  useEffect(() => {
    saveToStorage(CURRENT_WORKSPACE_KEY, currentWorkspace);
  }, [currentWorkspace]);

  const login = (email, password) => {
    const existingUser = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []).find(
      u => u.email === email && u.password === password
    );
    if (existingUser) {
      setUser({ email: existingUser.email, name: existingUser.name });
      // If user has memberships, set default workspace to first
      const userMemberships = memberships.filter(m => m.userEmail === existingUser.email);
      if (userMemberships.length && !currentWorkspace) {
        setCurrentWorkspace({ orgId: userMemberships[0].orgId, role: userMemberships[0].role });
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (name, email, password, orgOptions) => {
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = { name, email, password };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.REGISTERED_USERS, users);

    // Optionally create an org on registration
    if (orgOptions?.createOrg && orgOptions.orgName) {
      const orgId = Date.now();
      const newOrg = { id: orgId, name: orgOptions.orgName };
      setOrgs(prev => [...prev, newOrg]);
      const membership = { userEmail: email, orgId, role: 'Owner' };
      setMemberships(prev => [...prev, membership]);
      setCurrentWorkspace({ orgId, role: 'Owner' });
    }

    setUser({ email, name });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setCurrentWorkspace(null);
  };

  const createOrg = (name) => {
    const orgId = Date.now();
    const newOrg = { id: orgId, name };
    setOrgs(prev => [...prev, newOrg]);
    if (user) {
      const membership = { userEmail: user.email, orgId, role: 'Owner' };
      setMemberships(prev => [...prev, membership]);
      setCurrentWorkspace({ orgId, role: 'Owner' });
    }
    return newOrg;
  };

  const switchWorkspace = (orgId) => {
    const m = memberships.find(mm => mm.userEmail === user?.email && mm.orgId === orgId);
    if (m) setCurrentWorkspace({ orgId, role: m.role });
  };

  const getUserMemberships = () => memberships.filter(m => m.userEmail === user?.email);
  const getCurrentOrg = () => orgs.find(o => o.id === currentWorkspace?.orgId) || null;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated,
      login, register, logout,
      orgs, memberships, currentWorkspace,
      createOrg, switchWorkspace,
      getUserMemberships, getCurrentOrg,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
