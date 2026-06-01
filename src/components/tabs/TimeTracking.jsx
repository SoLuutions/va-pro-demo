import React, { useState, useMemo } from "react";
import { Clock, Building2, Calendar, Play, Pause } from "lucide-react";

export default function TimeTracking({
  clients,
  tasks,
  activeTimer,
  setActiveTimer,
  stopTimerAndLog,
  timerSeconds,
  formatTime,
  getClientName,
  getStatusColor,
  getPriorityColor,
  setSelectedTask,
  setShowNewTaskModal,
  setTimeEntries,
  setTasks,
  addToast,
}) {
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    clientId: clients[0]?.id || "",
    taskId: "",
    date: new Date().toISOString().split("T")[0],
    duration: 1.0,
    description: "",
  });

  // Keep manual logger task selection updated when client changes
  const clientTasks = useMemo(() => {
    if (!manualForm.clientId) return [];
    return tasks.filter((t) => t.clientId === parseInt(manualForm.clientId));
  }, [tasks, manualForm.clientId]);

  // Set default task ID when client changes
  React.useEffect(() => {
    if (clientTasks.length > 0) {
      setManualForm((f) => ({ ...f, taskId: clientTasks[0].id.toString() }));
    } else {
      setManualForm((f) => ({ ...f, taskId: "" }));
    }
  }, [clientTasks]);

  const handleSaveManualLog = (e) => {
    e.preventDefault();
    if (!manualForm.clientId || !manualForm.taskId || manualForm.duration <= 0) {
      addToast?.("Please select a valid client and task, and enter positive hours", "error");
      return;
    }

    const newEntry = {
      id: Date.now(),
      taskId: parseInt(manualForm.taskId),
      clientId: parseInt(manualForm.clientId),
      duration: parseFloat(manualForm.duration),
      date: manualForm.date,
      billable: true,
      description: manualForm.description || "Manual log",
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === newEntry.taskId
          ? { ...t, timeSpent: +(t.timeSpent + newEntry.duration).toFixed(2) }
          : t
      )
    );

    addToast?.(`Logged ${newEntry.duration} hours successfully`, "success");
    setShowManualModal(false);
    setManualForm({
      clientId: clients[0]?.id || "",
      taskId: "",
      date: new Date().toISOString().split("T")[0],
      duration: 1.0,
      description: "",
    });
  };

  const filteredTasks = useMemo(() => {
    if (clientFilter === "All Clients") return tasks;
    return tasks.filter((task) => getClientName(task.clientId) === clientFilter);
  }, [tasks, clientFilter, getClientName]);

  const columns = [
    { id: "To Do", title: "To Do", color: "bg-gray-100 border-gray-300" },
    { id: "In Progress", title: "In Progress", color: "bg-blue-50 border-blue-300" },
    { id: "Review", title: "Review", color: "bg-yellow-50 border-yellow-300" },
    { id: "Completed", title: "Completed", color: "bg-green-50 border-green-300" },
  ];

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const activeTask = tasks.find((t) => t.id === activeTimer);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Time Tracking - Kanban Board</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-transform hover:-translate-y-0.5"
          >
            Log Time Manually
          </button>
          <select 
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option>All Clients</option>
            {clients.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTask && (
        <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-red-500 rounded-full h-3 w-3"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Timer: {activeTask.title}</h3>
                <p className="text-sm text-gray-500">{getClientName(activeTask.clientId)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(timerSeconds)}</div>
              <button
                onClick={stopTimerAndLog}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <span>■</span>
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} border-2 rounded-t-lg p-3`}>
                <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-sm">{columnTasks.length}</span>
                </h3>
              </div>
              <div className="bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-lg p-2 flex-1 space-y-2 min-h-[500px]">
                {columnTasks.map((task) => {
                  const client = clients.find((c) => c.id === task.clientId);
                  const isActive = activeTimer === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                        isActive ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowNewTaskModal(true);
                      }}
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {task.title}
                            </h4>
                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{client?.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-700">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{task.timeSpent}h</span>
                          </div>
                        </div>

                        {task.status !== "Completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isActive) stopTimerAndLog(); else setActiveTimer(task.id);
                            }}
                            className={`w-full py-1.5 rounded-md text-xs font-medium flex items-center justify-center space-x-1 transition-colors ${
                              isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Pause className="h-3 w-3" />
                                <span>Stop Timer</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                <span>Start Timer</span>
                              </>
                            )}
                          </button>
                        )}

                        {task.recurring !== "None" && (
                          <div className="pt-2 border-t">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {task.recurring}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MANUAL TIME LOG MODAL --- */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in-slide-up">
            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Hours Manually</h3>
              <button 
                onClick={() => setShowManualModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveManualLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Client
                </label>
                <select
                  value={manualForm.clientId}
                  onChange={(e) => setManualForm({ ...manualForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  required
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Task
                </label>
                <select
                  value={manualForm.taskId}
                  onChange={(e) => setManualForm({ ...manualForm, taskId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  required
                  disabled={!manualForm.clientId}
                >
                  <option value="">-- Choose Task --</option>
                  {clientTasks.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="24"
                    value={manualForm.duration}
                    onChange={(e) => setManualForm({ ...manualForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description / Work Log Details
                </label>
                <textarea
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  rows="3"
                  placeholder="Summarize what was accomplished..."
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
