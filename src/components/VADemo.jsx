import React, { useState, useEffect } from "react";
import {
  BarChart3, Users, CheckCircle, Clock, DollarSign, Maximize2, LogOut, Sun, Moon, Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AppDataProvider, useAppData } from "../context/AppDataContext";
import ClientModal from "./ClientModal";
import TaskModal from "./TaskModal";
import ProfileModal from "./ProfileModal";
import FocusMode from "./FocusMode";
import CommandPalette from "./CommandPalette";
import Toast from "./Toast";
import { getTaskTimeRemaining, formatTimeRemaining } from "../utils/timeWindow";
import { notificationsManager } from "../utils/notifications";
import { saveToStorage, loadFromStorage } from "../utils/localStorage";

const Dashboard    = React.lazy(() => import("./tabs/Dashboard"));
const Clients      = React.lazy(() => import("./tabs/Clients"));
const Tasks        = React.lazy(() => import("./tabs/Tasks"));
const TimeTracking = React.lazy(() => import("./tabs/TimeTracking"));
const Reports      = React.lazy(() => import("./tabs/Reports"));
const Billing      = React.lazy(() => import("./tabs/Billing"));

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function Avatar({ profile, uiSettings, size = "" }) {
  const displayName = uiSettings.ndaMode ? "User" : profile.name;
  return (
    <div className={`va-avatar ${size}`}>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt="Avatar"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        getInitials(displayName)
      )}
    </div>
  );
}

// ── Inner shell — consumes context ───────────────────────────────────────────
function AppShell({ uiSettings, setUiSettings, addToast, dismissToast, toasts }) {
  const { logout } = useAuth();
  const {
    clients, setClients,
    tasks, setTasks,
    timeEntries, setTimeEntries,
    taskTemplates, setTaskTemplates,
    quickLinks, setQuickLinks,
    userProfile, setUserProfile,
    activeTimer, timerSeconds, isOnBreak,
    activeTask, activeClient,
    setActiveTimer, handleBreak,
    stopTimerAndLog, markTaskAsDone,
    formatTime, getStatusColor, getPriorityColor, getClientName, formatCurrency,
  } = useAppData();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const displayName = uiSettings.ndaMode ? "User" : userProfile.name;

  useEffect(() => {
    notificationsManager.requestPermission();
    return () => notificationsManager.clearAll();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((s) => !s);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setShowNewTaskModal(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === " ") {
        e.preventDefault();
        if (activeTask) setActiveTimer(activeTask.id);
        return;
      }
      if (e.key === "Escape" && showFocusMode) {
        setShowFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFocusMode, activeTask, setActiveTimer]);

  const tabs = [
    { id: "dashboard", name: "Dashboard",     icon: BarChart3 },
    { id: "clients",   name: "Clients",       icon: Users },
    { id: "tasks",     name: "Tasks",         icon: CheckCircle },
    { id: "time",      name: "Time Tracking", icon: Clock },
    { id: "reports",   name: "Reports",       icon: DollarSign },
    { id: "billing",   name: "Billing",       icon: DollarSign },
  ];

  const activeTabName = tabs.find((t) => t.id === activeTab)?.name ?? "Dashboard";

  const shared = {
    clients, tasks, timeEntries,
    setClients, setTasks, setTimeEntries,
    activeTimer, setActiveTimer,
    timerSeconds,
    formatTime, getStatusColor, getPriorityColor, getClientName, formatCurrency,
    stopTimerAndLog, markTaskAsDone,
    selectedClient, setSelectedClient,
    selectedTask, setSelectedTask,
    showNewTaskModal, setShowNewTaskModal,
    showNewClientModal, setShowNewClientModal,
    showInvoiceModal, setShowInvoiceModal,
    addToast,
    getTaskTimeRemaining, formatTimeRemaining,
    userProfile,
    quickLinks, setQuickLinks,
  };

  return (
    <div className="va-app">
      <div className="va-bg" aria-hidden="true" />

      {/* ── Sidebar ── */}
      <aside className="va-sidebar">
        <div className="va-brand">
          <div className="va-logo" />
          <span>VA Pro</span>
        </div>

        <div className="va-profile" onClick={() => setShowProfileModal(true)}>
          <Avatar profile={userProfile} uiSettings={uiSettings} />
          <div className="va-profile-meta">
            <div className="va-profile-name">{displayName}</div>
            <div className="va-profile-sub">PH • {userProfile.timezone}</div>
          </div>
        </div>

        <nav className="va-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`va-nav-item${activeTab === tab.id ? " active" : ""}`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="va-sidebar-footer">
          <button
            onClick={() => setUiSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
            className="va-icon-btn-sidebar"
            title={uiSettings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {uiSettings.darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button
            onClick={logout}
            className="va-icon-btn-sidebar"
            title="Logout"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="va-main">
        <div className="va-topbar">
          <button
            className="va-search"
            onClick={() => setShowCommandPalette(true)}
          >
            Search {activeTabName.toLowerCase()}… (Ctrl+K)
          </button>

          <div className="va-top-actions">
            <button
              className="va-icon-btn"
              onClick={() => setShowNewTaskModal(true)}
              title="New Task (Ctrl+N)"
            >
              <Plus className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="va-user" onClick={() => setShowProfileModal(true)}>
            <Avatar profile={userProfile} uiSettings={uiSettings} size="va-avatar-sm" />
            <div className="va-user-meta hidden sm:block">
              <div className="va-user-name">{displayName}</div>
              <div className="va-user-sub">Online</div>
            </div>
          </div>
        </div>

        {/* ── Active timer bar ── */}
        {activeTimer && !showFocusMode && (
          <div className="va-timer-bar">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-white rounded-full h-3 w-3" />
                <div>
                  <span className="font-semibold">
                    {activeTask?.title} {isOnBreak && "(On Break)"}
                  </span>
                  {activeClient && (
                    <span className="text-blue-200 ml-2">• {activeClient.name}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {activeTask?.estimatedMin && (() => {
                  const timeInfo = getTaskTimeRemaining(activeTask, timerSeconds);
                  return timeInfo.isOverrun ? (
                    <span className="text-sm text-red-200">
                      +{formatTimeRemaining(timeInfo.overrunSeconds)} overtime
                    </span>
                  ) : (
                    <span className="text-sm">{formatTimeRemaining(timeInfo.remainingSeconds)} left</span>
                  );
                })()}
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
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium"
                >
                  Mark as Done
                </button>
                <button
                  onClick={stopTimerAndLog}
                  className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg font-medium"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="va-content">
          <div className="va-content-inner">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
                </div>
              }
            >
              {activeTab === "dashboard" && <Dashboard {...shared} />}
              {activeTab === "clients"   && <Clients {...shared} tasks={tasks} timeEntries={timeEntries} uiSettings={uiSettings} />}
              {activeTab === "tasks"     && <Tasks {...shared} setTasks={setTasks} uiSettings={uiSettings} />}
              {activeTab === "time"      && <TimeTracking {...shared} />}
              {activeTab === "reports"   && <Reports {...shared} />}
              {activeTab === "billing"   && <Billing {...shared} uiSettings={uiSettings} />}
            </React.Suspense>
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {showNewClientModal && (
        <ClientModal
          client={selectedClient}
          clients={clients}
          setClients={setClients}
          onClose={() => { setShowNewClientModal(false); setSelectedClient(null); }}
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
          onSaveTemplate={(tpl) => setTaskTemplates((prev) => [tpl, ...prev])}
          onApplyTemplate={() => {}}
          onClose={() => { setShowNewTaskModal(false); setSelectedTask(null); }}
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
        handleStartStop={() => { if (activeTask) setActiveTimer(activeTask.id); }}
      />
    </div>
  );
}

// ── Root component — provides context ────────────────────────────────────────
const VADemo = () => {
  const { user } = useAuth();

  const [toasts, setToasts] = useState([]);
  const [uiSettings, setUiSettings] = useState(() =>
    loadFromStorage("va_pro_ui_settings", { darkMode: false, ndaMode: false })
  );

  const addToast = (message, type = "info") => {
    const toast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, toast]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    saveToStorage("va_pro_ui_settings", uiSettings);
    if (uiSettings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [uiSettings]);

  return (
    <AppDataProvider user={user} addToast={addToast}>
      <AppShell
        uiSettings={uiSettings}
        setUiSettings={setUiSettings}
        addToast={addToast}
        dismissToast={dismissToast}
        toasts={toasts}
      />
    </AppDataProvider>
  );
};

export default VADemo;
