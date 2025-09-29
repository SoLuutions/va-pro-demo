
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

const Dashboard = React.lazy(() => import("./tabs/Dashboard"));
const Clients = React.lazy(() => import("./tabs/Clients"));
const Tasks = React.lazy(() => import("./tabs/Tasks"));
const TimeTracking = React.lazy(() => import("./tabs/TimeTracking"));
const Reports = React.lazy(() => import("./tabs/Reports"));
const Billing = React.lazy(() => import("./tabs/Billing"));

const VADemo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [clients, setClients] = useState([
    {
      id: 1, name: "TechStart Solutions", email: "john@techstart.com",
      phone: "+1-555-0123", timezone: "EST (UTC-5)", location: "New York, USA",
      rate: 15, currency: "USD", billing: "Bi-monthly",
      notes: "Prefers morning communications. Focus on social media and content creation.",
      projects: ["Social Media Management", "Content Writing"], status: "Active",
      totalHours: 45.5, lastActivity: "2 hours ago",
    },
    {
      id: 2, name: "E-commerce Plus", email: "sarah@ecommerceplus.com",
      phone: "+1-555-0456", timezone: "PST (UTC-8)", location: "Los Angeles, USA",
      rate: 18, currency: "USD", billing: "Monthly",
      notes: "Needs detailed reports. Product research and data entry specialist.",
      projects: ["Product Research", "Data Entry"], status: "Active",
      totalHours: 62.3, lastActivity: "1 day ago",
    },
    {
      id: 3, name: "Digital Marketing Hub", email: "mike@dmhub.com",
      phone: "+44-20-1234-5678", timezone: "GMT (UTC+0)", location: "London, UK",
      rate: 20, currency: "USD", billing: "Monthly",
      notes: "Campaign management and analytics focus. Weekly check-ins required.",
      projects: ["PPC Management", "Analytics"], status: "Active",
      totalHours: 38.7, lastActivity: "5 hours ago",
    },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Create Instagram content calendar", description: "Design 30-day content calendar for Q4 campaign", clientId: 1, project: "Social Media Management", priority: "High", status: "In Progress", dueDate: "2025-09-28", timeSpent: 3.5, billable: true, recurring: "Monthly", attachments: ["https://drive.google.com/file/d/calendar-template"], createdAt: "2025-09-24" },
    { id: 2, title: "Product research - Electronics category", description: "Research top 50 electronics products for Q4 inventory", clientId: 2, project: "Product Research", priority: "Medium", status: "To Do", dueDate: "2025-09-30", timeSpent: 0, billable: true, recurring: "None", attachments: [], createdAt: "2025-09-25" },
    { id: 3, title: "Weekly PPC performance report", description: "Compile Google Ads performance data and insights", clientId: 3, project: "PPC Management", priority: "High", status: "Review", dueDate: "2025-09-27", timeSpent: 2.0, billable: true, recurring: "Weekly", attachments: ["https://drive.google.com/file/d/ppc-report-template"], createdAt: "2025-09-23" },
    { id: 4, title: "Data entry - Customer database", description: "Input 200 new customer records into CRM system", clientId: 2, project: "Data Entry", priority: "Low", status: "Completed", dueDate: "2025-09-25", timeSpent: 4.2, billable: true, recurring: "None", attachments: [], createdAt: "2025-09-22" },
  ]);

  const [timeEntries, setTimeEntries] = useState([
    { id: 1, taskId: 1, clientId: 1, duration: 2.5, date: "2025-09-26", billable: true, description: "Content calendar design" },
    { id: 2, taskId: 1, clientId: 1, duration: 1.0, date: "2025-09-25", billable: true, description: "Research and planning" },
    { id: 3, taskId: 3, clientId: 3, duration: 2.0, date: "2025-09-26", billable: true, description: "PPC data analysis" },
    { id: 4, taskId: 4, clientId: 2, duration: 4.2, date: "2025-09-24", billable: true, description: "Database entry work" },
  ]);

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

  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const stopTimerAndLog = () => {
    if (!activeTimer) return;
    const task = tasks.find((t) => t.id === activeTimer);
    if (!task) { setActiveTimer(null); setTimerSeconds(0); return; }
    const hours = +(timerSeconds / 3600).toFixed(2);
    const newEntry = {
      id: Date.now(),
      taskId: task.id,
      clientId: task.clientId,
      duration: hours,
      date: new Date().toISOString().slice(0,10),
      billable: true,
      description: `Auto-logged from timer for: ${task.title}`,
    };
    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, timeSpent: +(t.timeSpent + hours).toFixed(2) } : t));
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const shared = {
    clients, tasks, timeEntries,
    setClients, setTasks, setTimeEntries,
    activeTimer, setActiveTimer, timerSeconds, setTimerSeconds,
    formatTime, getStatusColor, getPriorityColor, getClientName, formatCurrency,
    stopTimerAndLog, selectedClient, setSelectedClient, selectedTask, setSelectedTask,
    showNewTaskModal, setShowNewTaskModal, showNewClientModal, setShowNewClientModal,
    showInvoiceModal, setShowInvoiceModal,
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
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Maria Santos</p>
                <p className="text-xs text-gray-500">PH • Asia/Manila</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-200" />
            </div>
          </div>
        </div>
      </nav>

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
    </div>
  );
};

export default VADemo;
