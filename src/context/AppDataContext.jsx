import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { canStartTimer, getTaskTimeRemaining, formatTimeRemaining, getClientDailyTimeLeft } from "../utils/timeWindow";
import { notificationsManager } from "../utils/notifications";
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from "../utils/localStorage";
import { fetchAllUserData, upsertUserDataKey } from "../utils/cloudStorage";
import { isSupabaseConfigured } from "../lib/supabase";

const AppDataContext = createContext(null);
const SAVE_DEBOUNCE_MS = 800;

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}

function useDebouncedCloudSave(userId, key, value, enabled) {
  const skipRef = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      skipRef.current = true;
      return;
    }

    if (skipRef.current) {
      skipRef.current = false;
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToStorage(key, value);
      if (userId && isSupabaseConfigured()) {
        upsertUserDataKey(userId, key, value);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [userId, key, value, enabled]);
}

export function AppDataProvider({ user, addToast, children }) {
  const [clients, setClients] = useState(() => loadFromStorage(STORAGE_KEYS.CLIENTS, []));
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.TASKS, []));
  const [timeEntries, setTimeEntries] = useState(() => loadFromStorage(STORAGE_KEYS.TIME_ENTRIES, []));
  const [taskTemplates, setTaskTemplates] = useState(() => loadFromStorage(STORAGE_KEYS.TASK_TEMPLATES, []));
  const [quickLinks, setQuickLinks] = useState(() => loadFromStorage(STORAGE_KEYS.QUICK_LINKS, []));
  const [userProfile, setUserProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, {
      name: "",
      email: "",
      timezone: "Asia/Manila",
      avatarUrl: "",
    })
  );
  const [dataLoading, setDataLoading] = useState(Boolean(user?.id && isSupabaseConfigured()));
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured() || !user?.id);

  const [activeTimer, setActiveTimer] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartedAt, setBreakStartedAt] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);

  const tasksRef = useRef([]);
  const clientsRef = useRef([]);
  const timeEntriesRef = useRef([]);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) {
      setHydrated(true);
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCloudData() {
      setDataLoading(true);
      setHydrated(false);

      try {
        const data = await fetchAllUserData(user.id, {
          [STORAGE_KEYS.CLIENTS]: [],
          [STORAGE_KEYS.TASKS]: [],
          [STORAGE_KEYS.TIME_ENTRIES]: [],
          [STORAGE_KEYS.TASK_TEMPLATES]: [],
          [STORAGE_KEYS.QUICK_LINKS]: [],
          [STORAGE_KEYS.USER_PROFILE]: {
            name: user.name || "",
            email: user.email || "",
            timezone: "Asia/Manila",
            avatarUrl: "",
          },
          [STORAGE_KEYS.ACTIVE_TIMER]: null,
        });

        if (cancelled) return;

        setClients(data[STORAGE_KEYS.CLIENTS] ?? []);
        setTasks(data[STORAGE_KEYS.TASKS] ?? []);
        setTimeEntries(data[STORAGE_KEYS.TIME_ENTRIES] ?? []);
        setTaskTemplates(data[STORAGE_KEYS.TASK_TEMPLATES] ?? []);
        setQuickLinks(data[STORAGE_KEYS.QUICK_LINKS] ?? []);
        setUserProfile(data[STORAGE_KEYS.USER_PROFILE] ?? {
          name: user.name || "",
          email: user.email || "",
          timezone: "Asia/Manila",
          avatarUrl: "",
        });

        const savedTimer = data[STORAGE_KEYS.ACTIVE_TIMER];
        if (savedTimer?.taskId && savedTimer?.startedAt) {
          const task = (data[STORAGE_KEYS.TASKS] ?? []).find((t) => t.id === savedTimer.taskId);
          if (task && task.status !== "Completed") {
            setActiveTimer(savedTimer.taskId);
            setTimerStartedAt(savedTimer.startedAt);
            setTotalBreakTime(savedTimer.totalBreakTime || 0);
          }
        }
      } catch (error) {
        console.error("Failed to load cloud data:", error);
        addToast?.("Could not load data from database. Using local cache.", "warning");
      } finally {
        if (!cancelled) {
          setHydrated(true);
          setDataLoading(false);
        }
      }
    }

    loadCloudData();
    return () => { cancelled = true; };
  }, [user?.id]);

  const persistEnabled = hydrated && Boolean(user?.id);

  useDebouncedCloudSave(user?.id, STORAGE_KEYS.CLIENTS, clients, persistEnabled);
  useDebouncedCloudSave(user?.id, STORAGE_KEYS.TASKS, tasks, persistEnabled);
  useDebouncedCloudSave(user?.id, STORAGE_KEYS.TIME_ENTRIES, timeEntries, persistEnabled);
  useDebouncedCloudSave(user?.id, STORAGE_KEYS.TASK_TEMPLATES, taskTemplates, persistEnabled);
  useDebouncedCloudSave(user?.id, STORAGE_KEYS.QUICK_LINKS, quickLinks, persistEnabled);
  useDebouncedCloudSave(user?.id, STORAGE_KEYS.USER_PROFILE, userProfile, persistEnabled);

  useEffect(() => { clientsRef.current = clients; }, [clients]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { timeEntriesRef.current = timeEntries; }, [timeEntries]);

  useEffect(() => {
    if (user && (!userProfile.name || !userProfile.email)) {
      setUserProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;

    const saved = loadFromStorage(STORAGE_KEYS.ACTIVE_TIMER);
    if (saved?.taskId && saved?.startedAt && !activeTimer) {
      const task = tasksRef.current.find((t) => t.id === saved.taskId);
      if (task && task.status !== "Completed") {
        setActiveTimer(saved.taskId);
        setTimerStartedAt(saved.startedAt);
        setTotalBreakTime(saved.totalBreakTime || 0);
      }
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const timerData = activeTimer && timerStartedAt
      ? { taskId: activeTimer, startedAt: timerStartedAt, totalBreakTime }
      : null;

    saveToStorage(STORAGE_KEYS.ACTIVE_TIMER, timerData);
    if (user?.id && isSupabaseConfigured()) {
      upsertUserDataKey(user.id, STORAGE_KEYS.ACTIVE_TIMER, timerData);
    }
  }, [activeTimer, timerStartedAt, totalBreakTime, hydrated, user?.id]);

  useEffect(() => {
    if (!activeTimer || !timerStartedAt || isOnBreak) return;

    let hasNotifiedTaskLimit = false;
    let hasNotifiedDailyLimit = false;

    const interval = setInterval(() => {
      const currentTasks = tasksRef.current;
      const currentClients = clientsRef.current;
      const currentEntries = timeEntriesRef.current;

      const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000) - totalBreakTime;
      setTimerSeconds(Math.max(0, elapsed));

      const task = currentTasks.find((t) => t.id === activeTimer);
      const client = currentClients.find((c) => c.id === task?.clientId);

      if (client?.dailyTimeLimitMin) {
        const hoursElapsed = elapsed / 3600;
        const dailyLimit = getClientDailyTimeLeft(client, currentEntries);
        const projectedMinutes = dailyLimit.minutesUsed + hoursElapsed * 60;
        if (projectedMinutes >= client.dailyTimeLimitMin && !hasNotifiedDailyLimit) {
          hasNotifiedDailyLimit = true;
          stopTimerAndLog();
          addToast(`Daily time limit reached for ${client.name}`, "warning");
          notificationsManager.showNotification("Daily limit reached", {
            body: `You've reached the daily time limit for ${client.name}`,
            type: "warning",
          });
        }
      }

      if (task?.estimatedMin) {
        const timeInfo = getTaskTimeRemaining(task, elapsed);
        if (timeInfo.remainingSeconds === 0 && !timeInfo.isOverrun && !hasNotifiedTaskLimit) {
          hasNotifiedTaskLimit = true;
          addToast("Task time limit reached!", "warning");
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHG2m98Om"
          );
          audio.play().catch(() => {});
          notificationsManager.showNotification("Time limit reached", {
            body: `"${task.title}" has reached its estimated time.`,
            type: "task-complete",
          });
          if (task.allowOverrun === false) {
            stopTimerAndLog();
            addToast("Timer auto-stopped (overrun not allowed)", "info");
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer, timerStartedAt, isOnBreak, totalBreakTime]);

  const handleStartTimer = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const client = clients.find((c) => c.id === task.clientId);
    const permission = canStartTimer(client, task, timeEntries);

    if (!permission.allowed) {
      addToast(permission.reason, "error");
      if (permission.nextSlotStart && client) {
        const formattedTime = new Date(permission.nextSlotStart).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        });
        addToast(`Next available slot: ${formattedTime}`, "info");
        notificationsManager.scheduleClientSlotNotification(client, permission.nextSlotStart, () => {
          addToast(`${client.name}'s time slot has started!`, "success");
        });
      }
      return;
    }

    if (activeTimer === taskId) {
      if (isOnBreak) {
        setIsOnBreak(false);
        setBreakStartedAt(null);
        addToast("Timer resumed", "success");
      } else {
        setIsOnBreak(true);
        setBreakStartedAt(new Date().toISOString());
        addToast("Timer paused", "info");
      }
    } else {
      if (activeTimer) stopTimerAndLog();
      setActiveTimer(taskId);
      setTimerStartedAt(new Date().toISOString());
      setTimerSeconds(0);
      setTotalBreakTime(0);
      setIsOnBreak(false);

      if (task.status !== "In Progress" && task.status !== "Completed") {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "In Progress" } : t)));
      }
      addToast(`Timer started for: ${task.title}`, "success");
    }
  };

  const handleBreak = () => {
    if (isOnBreak) {
      setIsOnBreak(false);
      setBreakStartedAt(null);
      addToast("Break ended", "success");
    } else {
      setIsOnBreak(true);
      setBreakStartedAt(new Date().toISOString());
      addToast("Break started", "info");
    }
  };

  const stopTimerAndLog = () => {
    if (!activeTimer) return;

    const task = tasksRef.current.find((t) => t.id === activeTimer);
    if (!task) {
      setActiveTimer(null); setTimerStartedAt(null);
      setTimerSeconds(0); setTotalBreakTime(0); setIsOnBreak(false);
      return;
    }

    const currentBreakExtra =
      isOnBreak && breakStartedAt
        ? Math.floor((Date.now() - new Date(breakStartedAt).getTime()) / 1000)
        : 0;
    const effectiveBreakTime = totalBreakTime + currentBreakExtra;
    const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000) - effectiveBreakTime;
    const hours = +(Math.max(0, elapsed) / 3600).toFixed(2);
    const timeInfo = getTaskTimeRemaining(task, elapsed);

    const newEntry = {
      id: Date.now(),
      taskId: task.id,
      clientId: task.clientId,
      duration: hours,
      date: DateTime.now().setZone("Asia/Manila").toISODate(),
      billable: true,
      description: timeInfo.isOverrun
        ? `Auto-logged (${formatTimeRemaining(timeInfo.overrunSeconds)} overtime): ${task.title}`
        : `Auto-logged: ${task.title}`,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, timeSpent: +(t.timeSpent + hours).toFixed(2) } : t))
    );

    setActiveTimer(null); setTimerStartedAt(null);
    setTimerSeconds(0); setTotalBreakTime(0);
    setIsOnBreak(false); setBreakStartedAt(null);

    addToast(`Timer stopped. Logged ${hours.toFixed(2)} hours`, "success");
  };

  const markTaskAsDone = () => {
    if (!activeTimer) return;

    const task = tasksRef.current.find((t) => t.id === activeTimer);
    if (!task) {
      setActiveTimer(null); setTimerStartedAt(null);
      setTimerSeconds(0); setTotalBreakTime(0); setIsOnBreak(false);
      return;
    }

    const currentBreakExtra =
      isOnBreak && breakStartedAt
        ? Math.floor((Date.now() - new Date(breakStartedAt).getTime()) / 1000)
        : 0;
    const effectiveBreakTime = totalBreakTime + currentBreakExtra;
    const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000) - effectiveBreakTime;
    const hours = +(Math.max(0, elapsed) / 3600).toFixed(2);
    const timeInfo = getTaskTimeRemaining(task, elapsed);

    const newEntry = {
      id: Date.now(),
      taskId: task.id,
      clientId: task.clientId,
      duration: hours,
      date: DateTime.now().setZone("Asia/Manila").toISODate(),
      billable: true,
      description: timeInfo.isOverrun
        ? `Task completed (${formatTimeRemaining(timeInfo.overrunSeconds)} overtime): ${task.title}`
        : `Task completed: ${task.title}`,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, timeSpent: +(t.timeSpent + hours).toFixed(2), status: "Completed" } : t
      )
    );

    setActiveTimer(null); setTimerStartedAt(null);
    setTimerSeconds(0); setTotalBreakTime(0);
    setIsOnBreak(false); setBreakStartedAt(null);

    addToast(`Task completed! Logged ${hours.toFixed(2)} hours`, "success");
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":       return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review":      return "bg-yellow-100 text-yellow-800";
      case "Completed":   return "bg-green-100 text-green-800";
      default:            return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":   return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low":    return "text-green-600";
      default:       return "text-gray-600";
    }
  };

  const getClientName = (clientId) =>
    clients.find((c) => c.id === clientId)?.name || "Unknown Client";

  const formatCurrency = (amount, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      }).format(amount);
    } catch {
      return `$${Number(amount || 0).toFixed(2)}`;
    }
  };

  const activeTask   = tasks.find((t) => t.id === activeTimer) || null;
  const activeClient = activeTask ? clients.find((c) => c.id === activeTask.clientId) : null;

  if (dataLoading) {
    return (
      <div className="va-app">
        <div className="va-bg" aria-hidden="true" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <AppDataContext.Provider
      value={{
        clients, setClients,
        tasks, setTasks,
        timeEntries, setTimeEntries,
        taskTemplates, setTaskTemplates,
        quickLinks, setQuickLinks,
        userProfile, setUserProfile,
        activeTimer,
        timerSeconds,
        isOnBreak,
        activeTask,
        activeClient,
        setActiveTimer: handleStartTimer,
        handleBreak,
        stopTimerAndLog,
        markTaskAsDone,
        formatTime,
        getStatusColor,
        getPriorityColor,
        getClientName,
        formatCurrency,
        getTaskTimeRemaining,
        formatTimeRemaining,
        dataLoading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
