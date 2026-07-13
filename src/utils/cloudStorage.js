import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Attach the Supabase access token so the Express API can verify ownership.
// In local demo mode (no Supabase) there is no token; the server skips auth.
async function getAuthHeaders() {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function fetchUserDataKey(userId, key, defaultValue = null) {
  if (!userId) return defaultValue;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("user_app_data")
        .select("data")
        .eq("user_id", userId)
        .eq("key", key)
        .maybeSingle();

      if (!error) {
        return data?.data ?? defaultValue;
      }
      console.warn(`[CloudStorage] Supabase error loading key "${key}":`, error.message);
    } catch (e) {
      console.warn(`[CloudStorage] Supabase exception loading key "${key}":`, e);
    }
  }

  // Fallback: load from local Express server API
  try {
    const response = await fetch(`/api/data/${userId}/${key}`, {
      headers: await getAuthHeaders(),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data ?? defaultValue;
      }
    }
  } catch (err) {
    console.error(`[CloudStorage] Local server fallback failed loading key "${key}":`, err);
  }

  return defaultValue;
}

export async function upsertUserDataKey(userId, key, value) {
  if (!userId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("user_app_data").upsert(
        {
          user_id: userId,
          key,
          data: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,key" }
      );

      if (!error) return true;
      console.warn(`[CloudStorage] Supabase error saving key "${key}":`, error.message);
    } catch (e) {
      console.warn(`[CloudStorage] Supabase exception saving key "${key}":`, e);
    }
  }

  // Fallback: save to local Express server API
  try {
    const response = await fetch(`/api/data/${userId}/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ data: value }),
    });
    if (response.ok) {
      const result = await response.json();
      return result.success;
    }
  } catch (err) {
    console.error(`[CloudStorage] Local server fallback failed saving key "${key}":`, err);
  }

  return false;
}

export async function fetchAllUserData(userId, keysWithDefaults) {
  if (!userId) {
    return Object.fromEntries(
      Object.entries(keysWithDefaults).map(([key, def]) => [key, def])
    );
  }

  const entries = await Promise.all(
    Object.entries(keysWithDefaults).map(async ([key, defaultValue]) => {
      const value = await fetchUserDataKey(userId, key, defaultValue);
      return [key, value];
    })
  );

  return Object.fromEntries(entries);
}
