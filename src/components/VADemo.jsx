import React, { useState, useEffect, useMemo } from "react";
import { DateTime } from "luxon";
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Maximize2,
} from "lucide-react";
import ClientModal from "./ClientModal";
import TaskModal from "./TaskModal";
import ProfileModal from "./ProfileModal";
import FocusMode from "./FocusMode";
import Toast from "./Toast";
import { canStartTimer, getTaskTimeRemaining, formatTimeRemaining } from "../utils/timeWindow";
import { notificationsManager } from "../utils/notifications";
import STORAGE_KEYS, { saveToStorage, loadFromStorage } from "../utils/localStorage";

const Dashboard = React.lazy(() => import("./tabs/Dashboard"));
const Clients = React.lazy(() => import("./tabs/Clients"));
const Tasks = React.lazy(() => import("./tabs/Tasks"));
const TimeTracking = React.lazy(() => import("./tabs/TimeTracking"));
const Reports = React.lazy(() => import("./tabs/Reports"));
const Billing = React.lazy(() => import("./tabs/Billing"));

const VADemo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartedAt, setBreakStartedAt] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [userProfile, setUserProfile] = useState(() => 
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, {
      name: "Maria Santos",
      email: "maria@example.com",
      timezone: "Asia/Manila",
      avatarUrl: ""
    })
  );

  const [clients, setClients] = useState(() => 
    loadFromStorage(STORAGE_KEYS.CLIENTS, [
      {
        id: 1, name: "TechStart Solutions", email: "john@techstart.com",
        phone: "+1-555-0123", timezone: "America/New_York", location: "New York, USA",
        rate: 15, currency: "USD", billing: "Bi-monthly",
        notes: "Prefers morning communications. Focus on social media and content creation.",
        projects: ["Social Media Management", "Content Writing"], status: "Active",
        totalHours: 45.5, lastActivity: "2 hours ago",
        dailyTimeLimitMin: 240,
        timeSlots: [{ start: "09:00", end: "17:00", tz: "America/New_York" }],
        enforceTimeSlots: false
      },
      {
        id: 2, name: "E-commerce Plus", email: "sarah@ecommerceplus.com",
        phone: "+1-555-0456", timezone: "America/Los_Angeles", location: "Los Angeles, USA",
        rate: 18, currency: "USD", billing: "Monthly",
        notes: "Needs detailed reports. Product research and data entry specialist.",
        projects: ["Product Research", "Data Entry"], status: "Active",
        totalHours: 62.3, lastActivity: "1 day ago",
        dailyTimeLimitMin: null,
        timeSlots: [],
        enforceTimeSlots: false
      },
      {
        id: 3, name: "Digital Marketing Hub", email: "mike@dmhub.com",
        phone: "+44-20-1234-5678", timezone: "Europe/London", location: "London, UK",
        rate: 20, currency: "USD", billing: "Monthly",
        notes: "Campaign management and analytics focus. Weekly check-ins required.",
        projects: ["PPC Management", "Analytics"], status: "Active",
        totalHours: 38.7, lastActivity: "5 hours ago",
        dailyTimeLimitMin: 180,
        timeSlots: [{ start: "08:00", end: "16:00", tz: "Europe/London" }],
        enforceTimeSlots: true
      },
    ])
  );

  const [tasks, setTasks] = useState(() => 
    loadFromStorage(STORAGE_KEYS.TASKS, [
      {
        id: 1, title: "Create Instagram content calendar", 
        description: "Design 30-day content calendar for Q4 campaign", 
        clientId: 1, project: "Social Media Management", priority: "High", 
        status: "In Progress", dueDate: "2025-09-28", timeSpent: 3.5, 
        billable: true, recurring: "Monthly", 
        attachments: ["https://drive.google.com/file/d/calendar-template"], 
        createdAt: "2025-09-24",
        estimatedMin: 120,
        allowOverrun: true
      },
      {
        id: 2, title: "Product research - Electronics category", 
        description: "Research top 50 electronics products for Q4 inventory", 
        clientId: 2, project: "Product Research", priority: "Medium", 
        status: "To Do", dueDate: "2025-09-30", timeSpent: 0, 
        billable: true, recurring: "None", attachments: [], 
        createdAt: "2025-09-25",
        estimatedMin: 90,
        allowOverrun: true
      },
      {
        id: 3, title: "Weekly PPC performance report", 
        description: "Compile Google Ads performance data and insights", 
        clientId: 3, project: "PPC Management", priority: "High", 
        status: "Review", dueDate: "2025-09-27", timeSpent: 2.0, 
        billable: true, recurring: "Weekly", 
        attachments: ["https://drive.google.com/file/d/ppc-report-template"], 
        createdAt: "2025-09-23",
        estimatedMin: 60,
        allowOverrun: false
      },
      {
        id: 4, title: "Data entry - Customer database", 
        description: "Input 200 new customer records into CRM system", 
        clientId: 2, project: "Data Entry", priority: "Low", 
        status: "Completed", dueDate: "2025-09-25", timeSpent: 4.2, 
        billable: true, recurring: "None", attachments: [], 
        createdAt: "2025-09-22",
        estimatedMin: 240,
        allowOverrun: true
      },
    ])
  );

  const [timeEntries, setTimeEntries] = useState(() => 
    loadFromStorage(STORAGE_KEYS.TIME_ENTRIES, [
      { id: 1, taskId: 1, clientId: 1, duration: 2.5, date: "2025-09-26", billable: true, description: "Content calendar design" },
      { id: 2, taskId: 1, clientId: 1, duration: 1.0, date: "2025-09-25", billable: true, description: "Research and planning" },
      { id: 3, taskId: 3, clientId: 3, duration: 2.0, date: "2025-09-26", billable: true, description: "PPC data analysis" },
      { id: 4, taskId: 4, clientId: 2, duration: 4.2, date: "2025-09-24", billable: true, description: "Database entry work" },
    ])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIME_ENTRIES, timeEntries);
  }, [timeEntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile);
  }, [userProfile]);

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
    let interval = null;
    let hasNotified = false;
    if (activeTimer && timerStartedAt && !isOnBreak) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000) - totalBreakTime;
        setTimerSeconds(Math.max(0, elapsed));
        
        const task = tasks.find(t => t.id === activeTimer);
        if (task && task.estimatedMin) {
          const timeInfo = getTaskTimeRemaining(task, elapsed);
          if (timeInfo.remainingSeconds === 0 && !timeInfo.isOverrun && !hasNotified) {
            hasNotified = true;
            addToast('Task time limit reached!', 'warning');
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
    } else if (isOnBreak && breakStartedAt) {
      interval = setInterval(() => {
        const breakElapsed = Math.floor((Date.now() - new Date(breakStartedAt).getTime()) / 1000);
        setTotalBreakTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStartedAt, isOnBreak, breakStartedAt, totalBreakTime, tasks]);

  useEffect(() => {
    notificationsManager.requestPermission();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showFocusMode) {
        setShowFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      notificationsManager.clearAll();
    };
  }, [showFocusMode]);

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
        addToast('Break ended, timer resumed', 'success');
      } else {
        setActiveTimer(null);
        setTimerStartedAt(null);
        setTimerSeconds(0);
        setTotalBreakTime(0);
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
    
    const task = tasks.find((t) => t.id === activeTimer);
    if (!task) {
      setActiveTimer(null);
      setTimerStartedAt(null);
      setTimerSeconds(0);
      setTotalBreakTime(0);
      return;
    }

    const hours = +(timerSeconds / 3600).toFixed(2);
    const timeInfo = getTaskTimeRemaining(task, timerSeconds);
    
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
    setShowFocusMode(false);
    
    addToast(`Timer stopped. Logged ${hours.toFixed(2)} hours`, 'success');
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
    stopTimerAndLog, selectedClient, setSelectedClient, selectedTask, setSelectedTask,
    showNewTaskModal, setShowNewTaskModal, showNewClientModal, setShowNewClientModal,
    showInvoiceModal, setShowInvoiceModal, addToast,
    getTaskTimeRemaining, formatTimeRemaining
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">VA Pro</h1>
              </div>
              <div className="flex space-x-2 sm:space-x-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                className="text-right cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => setShowProfileModal(true)}
              >
                <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                <p className="text-xs text-gray-500">PH • {userProfile.timezone}</p>
              </div>
              <div 
                className="h-8 w-8 rounded-full bg-blue-200 cursor-pointer hover:bg-blue-300"
                onClick={() => setShowProfileModal(true)}
              />
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
                onClick={stopTimerAndLog}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <React.Suspense fallback={<div className="p-6 bg-white border rounded-lg">Loading…</div>}>
          {activeTab === "dashboard" && <Dashboard {...shared} />}
          {activeTab === "clients" && <Clients {...shared} />}
          {activeTab === "tasks" && <Tasks {...shared} />}
          {activeTab === "time" && <TimeTracking {...shared} />}
          {activeTab === "reports" && <Reports {...shared} />}
          {activeTab === "billing" && <Billing {...shared} />}
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
          clients={clients}
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
          onExit={() => setShowFocusMode(false)}
          isOnBreak={isOnBreak}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default VADemo;
