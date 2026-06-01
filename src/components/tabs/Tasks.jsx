
import React, { useState, useMemo } from "react";
import { DateTime } from "luxon";
import { Plus, Search, Building2, Calendar, Clock, Play, Pause, ExternalLink, FileText, List, Grid, Trash2 } from "lucide-react";

export default function Tasks({
  clients,
  tasks,
  activeTimer,
  setActiveTimer,
  stopTimerAndLog,
  setSelectedTask,
  getStatusColor,
  getPriorityColor,
  getClientName,
  setShowNewTaskModal,
  setTasks,
  setTimeEntries,
  uiSettings,
}) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("dueDateAsc");

  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || task.status === statusFilter;
      const matchesClient = clientFilter === "All Clients" || getClientName(task.clientId) === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });

    // Apply Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "dueDateAsc") {
        return (a.dueDate || "").localeCompare(b.dueDate || "");
      }
      if (sortBy === "dueDateDesc") {
        return (b.dueDate || "").localeCompare(a.dueDate || "");
      }
      if (sortBy === "priorityHigh") {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === "timeSpentDesc") {
        return (b.timeSpent || 0) - (a.timeSpent || 0);
      }
      if (sortBy === "titleAsc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [tasks, searchText, statusFilter, clientFilter, getClientName, sortBy]);

  const getCalendarWeeks = () => {
    const now = DateTime.now().setZone('Asia/Manila');
    const startOfMonth = now.startOf('month');
    const endOfMonth = now.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const weeks = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const tasksForDay = filteredTasks.filter(task =>
          task.dueDate === currentDate.toISODate()
        );
        week.push({
          date: currentDate,
          tasks: tasksForDay,
          isCurrentMonth: currentDate.month === now.month
        });
        currentDate = currentDate.plus({ days: 1 });
      }
      weeks.push(week);
    }

    return weeks;
  };

  const calendarWeeks = viewMode === 'calendar' ? getCalendarWeeks() : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid className="h-4 w-4" />
              <span>Calendar</span>
            </button>
          </div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className={`rounded-lg shadow-sm border ${uiSettings?.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white'}`}>
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <option>All Status</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Completed</option>
            </select>
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="dueDateAsc">Due: Soonest First</option>
              <option value="dueDateDesc">Due: Latest First</option>
              <option value="priorityHigh">Priority: High First</option>
              <option value="timeSpentDesc">Hours: Most Logged</option>
              <option value="titleAsc">Title: A-Z</option>
            </select>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="p-4">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {DateTime.now().setZone('Asia/Manila').toFormat('MMMM yyyy')}
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
                  {day}
                </div>
              ))}
              {calendarWeeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`min-h-32 border rounded-lg p-2 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${day.date.toISODate() === DateTime.now().setZone('Asia/Manila').toISODate()
                          ? 'ring-2 ring-blue-500'
                          : ''
                        }`}
                    >
                      <div className={`text-sm font-semibold mb-2 ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                        {day.date.day}
                      </div>
                      <div className="space-y-1">
                        {day.tasks.slice(0, 3).map(task => {
                          const client = clients.find(c => c.id === task.clientId);
                          return (
                            <button
                              key={task.id}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowNewTaskModal(true);
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                }`}
                            >
                              <div className="font-medium truncate">{task.title}</div>
                              <div className="text-xs opacity-75 truncate">{client?.name}</div>
                            </button>
                          );
                        })}
                        {day.tasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{day.tasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No tasks found matching your filters
              </div>
            ) : (
              filteredTasks.map((task) => {
                const client = clients.find((c) => c.id === task.clientId);
                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>

                        {(task.fileLinks || task.outputLinks) && (
                          <div className="mb-3 space-y-2">
                            {task.fileLinks && (
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-2">
                                  {task.fileLinks.split('\n').filter(link => link.trim()).map((link, i) => (
                                    <a
                                      key={i}
                                      href={link.trim()}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                    >
                                      <span>File {i + 1}</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {task.outputLinks && (
                              <div className="flex items-start space-x-2">
                                <ExternalLink className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-2">
                                  {task.outputLinks.split('\n').filter(link => link.trim()).map((link, i) => (
                                    <a
                                      key={i}
                                      href={link.trim()}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
                                    >
                                      <span>Output {i + 1}</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {client?.name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {task.dueDate}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {task.timeSpent}h logged
                          </span>
                          {task.recurring !== "None" && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {task.recurring}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {task.status !== "Completed" && (
                          <button
                            onClick={() => setActiveTimer(activeTimer === task.id ? null : task.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 ${activeTimer === task.id
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                          >
                            {activeTimer === task.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            <span>{activeTimer === task.id ? "Pause" : "Start"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowNewTaskModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // Stop the timer first if this task is currently being tracked
                            if (activeTimer === task.id) {
                              stopTimerAndLog();
                            }
                            setTasks(prev => prev.filter(t => t.id !== task.id));
                            if (setTimeEntries) {
                              setTimeEntries(prev => prev.filter(entry => entry.taskId !== task.id));
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center space-x-1"
                          title="Delete task"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
