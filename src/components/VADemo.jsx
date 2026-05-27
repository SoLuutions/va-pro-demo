import React, { useState, useEffect, useMemo } from "react";
import { DateTime } from "luxon";
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Maximize2,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ClientModal from "./ClientModal";
import TaskModal from "./TaskModal";
import ProfileModal from "./ProfileModal";
import FocusMode from "./FocusMode";
import CommandPalette from "./CommandPalette";
import Toast from "./Toast";
import { canStartTimer, getTaskTimeRemaining, formatTimeRemaining, getClientDailyTimeLeft } from "../utils/timeWindow";
import { notificationsManager } from "../utils/notifications";
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from "../utils/localStorage";

const Dashboard = React.lazy(() => import("./tabs/Dashboard"));
const Clients = React.lazy(() => import("./tabs/Clients"));
const Tasks = React.lazy(() => import("./tabs/Tasks"));
const TimeTracking = React.lazy(() => import("./tabs/TimeTracking"));
const Reports = React.lazy(() => import("./tabs/Reports"));
const Billing = React.lazy(() => import("./tabs/Billing"));

const VADemo = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartedAt, setBreakStartedAt] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [uiSettings, setUiSettings] = useState(() =>
    loadFromStorage('va_pro_ui_settings', {
      darkMode: false,
      ndaMode: false,
    })
  );

  // Refs so the timer interval always sees fresh data without recreating every tick
  const tasksRef = React.useRef([]);
  const clientsRef = React.useRef([]);
  const timeEntriesRef = React.useRef([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [userProfile, setUserProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, {
      name: "",
      email: "",
      timezone: "Asia/Manila",
      avatarUrl: ""
    })
  );

  const [clients, setClients] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CLIENTS, [])
  );

  const [tasks, setTasks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, [])
  );

  const [timeEntries, setTimeEntries] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TIME_ENTRIES, [])
  );

  const [taskTemplates, setTaskTemplates] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TASK_TEMPLATES, [])
  );

  const [quickLinks, setQuickLinks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.QUICK_LINKS, [])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
    clientsRef.current = clients;
  }, [clients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, timeEntries);
    timeEntriesRef.current = timeEntries;
  }, [timeEntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASK_TEMPLATES, taskTemplates);
  }, [taskTemplates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.QUICK_LINKS, quickLinks);
  }, [quickLinks]);

  useEffect(() => {
    saveToStorage('va_pro_ui_settings', uiSettings);
    const root = document.documentElement;
    if (uiSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [uiSettings]);

  useEffect(() => {
    if (user && (!userProfile.name || !userProfile.email)) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  useEffect(() => {
    const savedTimer = loadFromStorage(STORAGE_KEYS.ACTIVE_TIMER);
    if (savedTimer && savedTimer.taskId && savedTimer.startedAt) {
      const task = tasks.find(t => t.id === savedTimer.taskId);
      if (task && task.status !== 'Completed') {
        setActiveTimer(savedTimer.taskId);
        setTimerStartedAt(savedTimer.startedAt);
        setTotalBreakTime(savedTimer.totalBreakTime || 0);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTimer && timerStartedAt) {
      saveToStorage(STORAGE_KEYS.ACTIVE_TIMER, {
        taskId: activeTimer,
        startedAt: timerStartedAt,
        totalBreakTime
      });
    } else {
      saveToStorage(STORAGE_KEYS.ACTIVE_TIMER, null);
    }
  }, [activeTimer, timerStartedAt, totalBreakTime]);

  useEffect(() => {
    if (!activeTimer || !timerStartedAt || isOnBreak) return;

    let hasNotifiedTaskLimit = false;
    let hasNotifiedDailyLimit = false;

    const interval = setInterval(() => {
      // Use refs so interval stays stable without being recreated on every state change
      const currentTasks = tasksRef.current;
      const currentClients = clientsRef.current;
      const currentEntries = timeEntriesRef.current;

      const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000) - totalBreakTime;
      setTimerSeconds(Math.max(0, elapsed));

      const task = currentTasks.find(t => t.id === activeTimer);
      const client = currentClients.find(c => c.id === task?.clientId);

      if (client && client.dailyTimeLimitMin) {
        const hoursElapsed = elapsed / 3600;
        const dailyLimit = getClientDailyTimeLeft(client, currentEntries);
        const projectedMinutes = dailyLimit.minutesUsed + (hoursElapsed * 60);
        if (projectedMinutes >= client.dailyTimeLimitMin && !hasNotifiedDailyLimit) {
          hasNotifiedDailyLimit = true;
          stopTimerAndLog();
          addToast(`Daily time limit reached for ${client.name}`, 'warning');
          notificationsManager.showNotification(
            'Daily limit reached',
            { body: `You've reached the daily time limit for ${client.name}`, type: 'warning' }
          );
        }
      }

      if (task && task.estimatedMin) {
        const timeInfo = getTaskTimeRemaining(task, elapsed);
        if (timeInfo.remainingSeconds === 0 && !timeInfo.isOverrun && !hasNotifiedTaskLimit) {
          hasNotifiedTaskLimit = true;
          addToast('Task time limit reached!', 'warning');
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHG2m98Om');
          audio.play().catch(() => {});
          notificationsManager.showNotification(
            'Time limit reached',
            { body: `"${task.title}" has reached its estimated time.`, type: 'task-complete' }
          );
          if (task.allowOverrun === false) {
            stopTimerAndLog();
            addToast('Timer auto-stopped (overrun not allowed)', 'info');
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // Intentionally omit tasks/clients/timeEntries — accessed via stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer, timerStartedAt, isOnBreak, totalBreakTime]);

  useEffect(() => {
    notificationsManager.requestPermission();
    return () => notificationsManager.clearAll();
  }, []);

  useEffect(() => {
    // Re-register whenever activeTimer or showFocusMode changes so activeTask is fresh
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(s => !s);
        return;
      }
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowNewTaskModal(true);
        return;
      }
      if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const currentActiveTask = tasksRef.current.find(t => t.id === activeTimer);
        if (currentActiveTask) {
          handleStartTimer(currentActiveTask.id);
        }
        return;
      }
      if (e.key === 'Escape' && showFocusMode) {
        setShowFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFocusMode, activeTimer]);

  const addToast = (message, type = 'info') => {
    const toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, toast]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleStartTimer = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const client = clients.find(c => c.id === task.clientId);
    const permission = canStartTimer(client, task, timeEntries);

    if (!permission.allowed) {
      addToast(permission.reason, 'error');

      if (permission.nextSlotStart && client) {
        const nextSlotDate = new Date(permission.nextSlotStart);
        const formattedTime = nextSlotDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'Asia/Manila'
        });
        addToast(`Next available slot: ${formattedTime}`, 'info');

        notificationsManager.scheduleClientSlotNotification(
          client,
          permission.nextSlotStart,
          () => {
            addToast(`${client.name}'s time slot has started!`, 'success');
          }
        );
      }
      return;
    }

    if (activeTimer === taskId) {
      if (isOnBreak) {
        setIsOnBreak(false);
        setBreakStartedAt(null);
        addToast('Timer resumed', 'success');
      } else {
        setIsOnBreak(true);
        setBreakStartedAt(new Date().toISOString());
        addToast('Timer paused', 'info');
      }
    } else {
      if (activeTimer) {
        stopTimerAndLog();
      }
      setActiveTimer(taskId);
      setTimerStartedAt(new Date().toISOString());
      setTimerSeconds(0);
      setTotalBreakTime(0);
      setIsOnBreak(false);

      if (task.status !== 'In Progress' && task.status !== 'Completed') {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'In Progress' } : t
        ));
      }

      addToast(`Timer started for: ${task.title}`, 'success');
    }
  };

  const handleBreak = () => {
    if (isOnBreak) {
      setIsOnBreak(false);
      setBreakStartedAt(null);
      addToast('Break ended', 'success');
    } else {
      setIsOnBreak(true);
      setBreakStartedAt(new Date().toISOString());
      addToast('Break started', 'info');
    }
  };

  const stopTimerAndLog = () => {
    if (!activeTimer) return;

    const task = tasksRef.current.find((t) => t.id === activeTimer);
    if (!task) {
      setActiveTimer(null);
      setTimerStartedAt(null);
      setTimerSeconds(0);
      setTotalBreakTime(0);
      setIsOnBreak(false);
      return;
    }

    // Account for any break still in progress
    const currentBreakExtra = isOnBreak && breakStartedAt
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
      date: DateTime.now().setZone('Asia/Manila').toISODate(),
      billable: true,
      description: timeInfo.isOverrun
        ? `Auto-logged (${formatTimeRemaining(timeInfo.overrunSeconds)} overtime): ${task.title}`
        : `Auto-logged: ${task.title}`,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) => prev.map((t) =>
      t.id === task.id ? { ...t, timeSpent: +(t.timeSpent + hours).toFixed(2) } : t
    ));

    setActiveTimer(null);
    setTimerStartedAt(null);
    setTimerSeconds(0);
    setTotalBreakTime(0);
    setIsOnBreak(false);
    setBreakStartedAt(null);
    setShowFocusMode(false);

    addToast(`Timer stopped. Logged ${hours.toFixed(2)} hours`, 'success');
  };

  const markTaskAsDone = () => {
    if (!activeTimer) return;

    const task = tasksRef.current.find((t) => t.id === activeTimer);
    if (!task) {
      setActiveTimer(null);
      setTimerStartedAt(null);
      setTimerSeconds(0);
      setTotalBreakTime(0);
      setIsOnBreak(false);
      return;
    }

    const currentBreakExtra = isOnBreak && breakStartedAt
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
      date: DateTime.now().setZone('Asia/Manila').toISODate(),
      billable: true,
      description: timeInfo.isOverrun
        ? `Task completed (${formatTimeRemaining(timeInfo.overrunSeconds)} overtime): ${task.title}`
        : `Task completed: ${task.title}`,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) => prev.map((t) =>
      t.id === task.id ? {
        ...t,
        timeSpent: +(t.timeSpent + hours).toFixed(2),
        status: 'Completed'
      } : t
    ));

    setActiveTimer(null);
    setTimerStartedAt(null);
    setTimerSeconds(0);
    setTotalBreakTime(0);
    setIsOnBreak(false);
    setBreakStartedAt(null);
    setShowFocusMode(false);

    addToast(`Task completed! Logged ${hours.toFixed(2)} hours`, 'success');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getClientName = (clientId) => clients.find((c) => c.id === clientId)?.name || "Unknown Client";

  const formatCurrency = (amount, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-PH", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(amount);
    } catch (_) {
      return `$${Number(amount || 0).toFixed(2)}`;
    }
  };

  const activeTask = tasks.find(t => t.id === activeTimer);
  const activeClient = activeTask ? clients.find(c => c.id === activeTask.clientId) : null;

  const shared = {
    clients, tasks, timeEntries,
    setClients, setTasks, setTimeEntries,
    activeTimer, setActiveTimer: handleStartTimer,
    timerSeconds, setTimerSeconds,
    formatTime, getStatusColor, getPriorityColor, getClientName, formatCurrency,
    stopTimerAndLog, markTaskAsDone, selectedClient, setSelectedClient, selectedTask, setSelectedTask,
    showNewTaskModal, setShowNewTaskModal, showNewClientModal, setShowNewClientModal,
    showInvoiceModal, setShowInvoiceModal, addToast,
    getTaskTimeRemaining, formatTimeRemaining,
    userProfile,
    quickLinks, setQuickLinks
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "clients", name: "Clients", icon: Users },
    { id: "tasks", name: "Tasks", icon: CheckCircle },
    { id: "time", name: "Time Tracking", icon: Clock },
    { id: "reports", name: "Reports", icon: DollarSign },
    { id: "billing", name: "Billing", icon: DollarSign },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950`}>
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">VA Pro</h1>
              </div>
              <div className="flex space-x-2 sm:space-x-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setUiSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title={uiSettings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {uiSettings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div
                className="text-right cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                onClick={() => setShowProfileModal(true)}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{uiSettings.ndaMode ? 'User' : userProfile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PH • {userProfile.timezone}</p>
              </div>
              <div
                className="h-8 w-8 rounded-full overflow-hidden bg-blue-200 dark:bg-blue-700 cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-600 flex items-center justify-center"
                onClick={() => setShowProfileModal(true)}
              >
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {activeTimer && !showFocusMode && (
        <div className="bg-blue-600 text-white py-3 px-4 sticky top-16 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-white rounded-full h-3 w-3"></div>
              <div>
                <span className="font-semibold">
                  {activeTask?.title} {isOnBreak && '(On Break)'}
                </span>
                {activeClient && (
                  <span className="text-blue-200 ml-2">• {activeClient.name}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {activeTask?.estimatedMin && (
                <div className="text-sm">
                  {(() => {
                    const timeInfo = getTaskTimeRemaining(activeTask, timerSeconds);
                    return timeInfo.isOverrun ? (
                      <span className="text-red-200">
                        +{formatTimeRemaining(timeInfo.overrunSeconds)} overtime
                      </span>
                    ) : (
                      <span>{formatTimeRemaining(timeInfo.remainingSeconds)} left</span>
                    );
                  })()}
                </div>
              )}
              <div className="text-2xl font-mono font-bold">{formatTime(timerSeconds)}</div>
              <button
                onClick={() => setShowFocusMode(true)}
                className="p-2 bg-blue-700 hover:bg-blue-800 rounded-lg"
                title="Enter Focus Mode"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                onClick={markTaskAsDone}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium"
              >
                Mark as Done
              </button>
              <button
                onClick={stopTimerAndLog}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8`}>
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        }>
          {activeTab === "dashboard" && <Dashboard {...shared} />}
          {activeTab === "clients" && <Clients {...shared} tasks={tasks} timeEntries={timeEntries} uiSettings={uiSettings} />}
          {activeTab === "tasks" && <Tasks {...shared} setTasks={setTasks} uiSettings={uiSettings} />}
          {activeTab === "time" && <TimeTracking {...shared} />}
          {activeTab === "reports" && <Reports {...shared} />}
          {activeTab === "billing" && <Billing {...shared} uiSettings={uiSettings} />}
        </React.Suspense>
      </main>

      {showNewClientModal && (
        <ClientModal
          client={selectedClient}
          clients={clients}
          setClients={setClients}
          onClose={() => {
            setShowNewClientModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showNewTaskModal && (
        <TaskModal
          task={selectedTask}
          tasks={tasks}
          setTasks={setTasks}
          timeEntries={timeEntries}
          setTimeEntries={setTimeEntries}
          clients={clients}
          templates={taskTemplates}
          onSaveTemplate={(tpl) => setTaskTemplates(prev => [tpl, ...prev])}
          onApplyTemplate={() => { }}
          onClose={() => {
            setShowNewTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          profile={userProfile}
          onSave={setUserProfile}
          uiSettings={uiSettings}
          onUpdateUiSettings={setUiSettings}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showFocusMode && activeTask && (
        <FocusMode
          task={activeTask}
          client={activeClient}
          timerSeconds={timerSeconds}
          onBreak={handleBreak}
          onStop={stopTimerAndLog}
          onMarkAsDone={markTaskAsDone}
          onExit={() => setShowFocusMode(false)}
          isOnBreak={isOnBreak}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        setShowNewTaskModal={setShowNewTaskModal}
        setShowNewClientModal={setShowNewClientModal}
        setActiveTab={setActiveTab}
        handleStartStop={() => {
          if (activeTask) handleStartTimer(activeTask.id);
        }}
      />
    </div>
  );
};

export default VADemo;
