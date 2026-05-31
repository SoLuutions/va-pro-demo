import { supabase, isSupabaseConfigured } from "../lib/supabase";

export async function fetchUserDataKey(userId, key, defaultValue = null) {
  if (!isSupabaseConfigured() || !userId) return defaultValue;

  const { data, error } = await supabase
    .from("user_app_data")
    .select("data")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load ${key}:`, error.message);
    return defaultValue;
  }

  return data?.data ?? defaultValue;
}

export async function upsertUserDataKey(userId, key, value) {
  if (!isSupabaseConfigured() || !userId) return false;

  const { error } = await supabase.from("user_app_data").upsert(
    {
      user_id: userId,
      key,
      data: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,key" }
  );

  if (error) {
    console.error(`Failed to save ${key}:`, error.message);
    return false;
  }

  return true;
}

export async function fetchAllUserData(userId, keysWithDefaults) {
  if (!isSupabaseConfigured() || !userId) {
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
