import React, { createContext, useState, useContext, useEffect } from "react";
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from "../utils/localStorage";
import { supabase, isSupabaseConfigured, mapSupabaseUser } from "../lib/supabase";
import { formatAuthError, formatLoginError, isDuplicateSignup } from "../utils/authErrors";

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
    return { success: false, error: formatLoginError("Invalid email or password") };
  };

  const registerLocal = async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = loadFromStorage(STORAGE_KEYS.REGISTERED_USERS, []);
    if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: formatAuthError("already registered") };
    }
    const hashed = await hashPassword(password);
    users.push({ name, email: normalizedEmail, password: hashed });
    saveToStorage(STORAGE_KEYS.REGISTERED_USERS, users);
    setUser({ id: normalizedEmail, email: normalizedEmail, name });
    return { success: true };
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured()) return loginLocal(email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { success: false, error: formatLoginError(error.message) };

    const mapped = mapSupabaseUser(data.user);
    setUser(mapped);
    return { success: true };
  };

  const register = async (name, email, password) => {
    if (!isSupabaseConfigured()) return registerLocal(name, email, password);

    const trimmedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      return { success: false, error: formatAuthError(error.message) };
    }

    if (isDuplicateSignup(data)) {
      return { success: false, error: formatAuthError("already registered") };
    }

    if (data.session) {
      setUser(mapSupabaseUser(data.user));
      return { success: true };
    }

    // Fallback if confirmation is still required: server auto-confirms (npm run dev)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: trimmedEmail, password }),
      });
      const result = await response.json();

      if (result.success) return login(trimmedEmail, password);

      return {
        success: false,
        error: result.error?.title
          ? result.error
          : formatAuthError(result.error || "Registration failed"),
      };
    } catch {
      return {
        success: false,
        error: formatAuthError("Failed to fetch"),
      };
    }
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
