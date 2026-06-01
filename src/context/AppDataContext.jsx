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
    if (user?.id && isSupabaseConfigured() && timerData) {
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

  // --- ONLINE/OFFLINE DETECTOR ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Connection restored. Syncing with database...", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("You are offline. Working in local-only mode.", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // --- IDLE DETECTION & AUTO-PAUSE ---
  const lastActivityRef = useRef(Date.now());
  const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes inactivity
  useEffect(() => {
    if (!activeTimer || isOnBreak) return;

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    lastActivityRef.current = Date.now();

    const checkIdle = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= IDLE_LIMIT_MS) {
        handleBreak();
        addToast("Timer auto-paused due to inactivity", "warning");
        notificationsManager.showNotification("Timer Paused", {
          body: "We auto-paused your timer because you've been inactive for 5 minutes.",
          type: "warning"
        });
      }
    }, 10000);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      clearInterval(checkIdle);
    };
  }, [activeTimer, isOnBreak]);

  // --- AUTOMATED DEMO DATA SEEDER ---
  const seedDemoData = () => {
    const today = DateTime.now().setZone("Asia/Manila");
    const todayStr = today.toISODate();
    const yesterdayStr = today.minus({ days: 1 }).toISODate();
    const twoDaysAgoStr = today.minus({ days: 2 }).toISODate();
    const threeDaysAgoStr = today.minus({ days: 3 }).toISODate();
    const fourDaysAgoStr = today.minus({ days: 4 }).toISODate();

    const seededClients = [
      { id: 1, name: "Acme Corp", email: "contact@acme.com", rate: 15, currency: "USD", timezone: "America/New_York", dailyTimeLimitMin: 480 },
      { id: 2, name: "Globex Inc", email: "billing@globex.com", rate: 20, currency: "EUR", timezone: "Europe/London", dailyTimeLimitMin: 240 },
      { id: 3, name: "Nexus Tech", email: "support@nexustech.io", rate: 25, currency: "AUD", timezone: "Australia/Sydney", dailyTimeLimitMin: 300 }
    ];

    const seededTasks = [
      { id: 101, title: "Inbox Management & Email Triage", clientId: 1, project: "Operations", priority: "High", status: "Completed", estimatedMin: 90, timeSpent: 1.5, dueDate: todayStr },
      { id: 102, title: "Weekly Social Media Schedule", clientId: 1, project: "Marketing", priority: "Medium", status: "In Progress", estimatedMin: 180, timeSpent: 2.0, dueDate: today.plus({ days: 1 }).toISODate() },
      { id: 103, title: "Monthly Financial Reconciliation", clientId: 2, project: "Finance", priority: "High", status: "To Do", estimatedMin: 240, timeSpent: 0, dueDate: today.plus({ days: 3 }).toISODate() },
      { id: 104, title: "Customer Support Tickets", clientId: 2, project: "Operations", priority: "Low", status: "Completed", estimatedMin: 120, timeSpent: 4.0, dueDate: yesterdayStr },
      { id: 105, title: "Technical SEO Audit", clientId: 3, project: "Marketing", priority: "High", status: "Review", estimatedMin: 300, timeSpent: 7.5, dueDate: todayStr },
      { id: 106, title: "Design landing page mockup", clientId: 3, project: "Design", priority: "Medium", status: "To Do", estimatedMin: 180, timeSpent: 0, dueDate: today.plus({ days: 5 }).toISODate() }
    ];

    const seededTimeEntries = [
      { id: 201, taskId: 101, clientId: 1, duration: 1.5, date: todayStr, billable: true, description: "Cleared backlog and triaged urgent client emails." },
      { id: 202, taskId: 102, clientId: 1, duration: 2.0, date: todayStr, billable: true, description: "Drafted copy for Twitter and LinkedIn posts." },
      { id: 203, taskId: 104, clientId: 2, duration: 2.5, date: yesterdayStr, billable: true, description: "Resolved Zendesk tickets and escalated technical issues." },
      { id: 204, taskId: 105, clientId: 3, duration: 4.0, date: yesterdayStr, billable: true, description: "Crawled website and compiled errors in Google Sheets." },
      { id: 205, taskId: 105, clientId: 3, duration: 3.5, date: twoDaysAgoStr, billable: true, description: "Drafted structural recommendation report." },
      { id: 206, taskId: 102, clientId: 1, duration: 3.0, date: twoDaysAgoStr, billable: true, description: "Compiled image assets and social media graphics." },
      { id: 207, taskId: 104, clientId: 2, duration: 1.5, date: threeDaysAgoStr, billable: true, description: "Followed up on open customer service issues." },
      { id: 208, taskId: 101, clientId: 1, duration: 2.0, date: fourDaysAgoStr, billable: true, description: "Morning email check-in and task prioritizing." },
      { id: 209, taskId: 105, clientId: 3, duration: 4.0, date: fourDaysAgoStr, billable: true, description: "Keywords research and analysis." }
    ];

    const seededQuickLinks = [
      { id: 301, name: "Zoom Meeting", url: "https://zoom.us", icon: "video" },
      { id: 302, name: "Slack Workspace", url: "https://slack.com", icon: "message" },
      { id: 303, name: "Client Drive", url: "https://drive.google.com", icon: "folder" },
      { id: 304, name: "Portfolio Website", url: "https://github.com", icon: "globe" }
    ];

    setClients(seededClients);
    setTasks(seededTasks);
    setTimeEntries(seededTimeEntries);
    setQuickLinks(seededQuickLinks);

    saveToStorage(STORAGE_KEYS.CLIENTS, seededClients);
    saveToStorage(STORAGE_KEYS.TASKS, seededTasks);
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, seededTimeEntries);
    saveToStorage(STORAGE_KEYS.QUICK_LINKS, seededQuickLinks);

    if (user?.id && isSupabaseConfigured()) {
      upsertUserDataKey(user.id, STORAGE_KEYS.CLIENTS, seededClients);
      upsertUserDataKey(user.id, STORAGE_KEYS.TASKS, seededTasks);
      upsertUserDataKey(user.id, STORAGE_KEYS.TIME_ENTRIES, seededTimeEntries);
      upsertUserDataKey(user.id, STORAGE_KEYS.QUICK_LINKS, seededQuickLinks);
    }

    addToast("Mock demo data seeded successfully! Try reloading tabs to see changes.", "success");
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
        seedDemoData,
        isOnline,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
