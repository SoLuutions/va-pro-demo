import React, { createContext, useState, useContext, useEffect } from "react";
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from "../utils/localStorage";
import { supabase, isSupabaseConfigured, mapSupabaseUser } from "../lib/supabase";

const AuthContext = createContext(null);

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.AUTH_USER, null));
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured());

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const mapped = mapSupabaseUser(session?.user ?? null);
      setUser(mapped);
      if (mapped) saveToStorage(STORAGE_KEYS.AUTH_USER, mapped);
      else localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const mapped = mapSupabaseUser(session?.user ?? null);
      setUser(mapped);
      if (mapped) saveToStorage(STORAGE_KEYS.AUTH_USER, mapped);
      else localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() && user) {
      saveToStorage(STORAGE_KEYS.AUTH_USER, user);
    } else if (!isSupabaseConfigured() && !user) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [user]);

  const loginLocal = async (email, password) => {
    const hashed = await hashPassword(password);
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    const existingUser = users.find(
      (u) => u.email === email && (u.password === hashed || u.password === password)
    );
    if (existingUser) {
      if (existingUser.password === password) {
        const migrated = users.map((u) =>
          u.email === email ? { ...u, password: hashed } : u
        );
        saveToStorage(STORAGE_KEYS.REGISTERED_USERS, migrated);
      }
      setUser({ id: existingUser.email, email: existingUser.email, name: existingUser.name });
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const registerLocal = async (name, email, password) => {
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }
    const hashed = await hashPassword(password);
    users.push({ name, email, password: hashed });
    saveToStorage(STORAGE_KEYS.REGISTERED_USERS, users);
    setUser({ id: email, email, name });
    return { success: true };
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured()) return loginLocal(email, password);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const mapped = mapSupabaseUser(data.user);
    setUser(mapped);
    return { success: true };
  };

  const register = async (name, email, password) => {
    if (!isSupabaseConfigured()) return registerLocal(name, email, password);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) return { success: false, error: error.message };

    if (data.session) {
      setUser(mapSupabaseUser(data.user));
      return { success: true };
    }

    return {
      success: true,
      message: "Account created. Check your email to confirm, then sign in.",
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
