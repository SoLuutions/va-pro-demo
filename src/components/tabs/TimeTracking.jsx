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
}) {
  const [clientFilter, setClientFilter] = useState("All Clients");

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
        <h2 className="text-2xl font-bold text-gray-900">Time Tracking - Kanban Board</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                onClick={() => stopTimerAndLog()}
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
              <div className={`${column.color} border-2 rounded-t-lg p-3 dark:bg-gray-800 dark:border-gray-700`}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="bg-white px-2 py-1 rounded-full text-sm dark:bg-gray-700 dark:text-gray-100">{columnTasks.length}</span>
                </h3>
              </div>
              <div className="bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-lg p-2 flex-1 space-y-2 min-h-[500px] dark:bg-gray-900 dark:border-gray-700">
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
                              if (isActive) {
                                stopTimerAndLog();
                              } else {
                                setActiveTimer(task.id);
                              }
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
    </div>
  );
}
