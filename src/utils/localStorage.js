const STORAGE_KEYS = {
  CLIENTS: 'va_pro_clients',
  TASKS: 'va_pro_tasks',
  TIME_ENTRIES: 'va_pro_time_entries',
  ACTIVE_TIMER: 'va_pro_active_timer',
  USER_PROFILE: 'va_pro_user_profile',
  BREAKS: 'va_pro_breaks'
};

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
}

export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

export default STORAGE_KEYS;
