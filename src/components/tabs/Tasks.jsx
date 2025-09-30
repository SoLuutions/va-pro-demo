
import React, { useState, useMemo } from "react";
import { Plus, Search, Building2, Calendar, Clock, Play, Pause } from "lucide-react";

export default function Tasks({
  clients,
  tasks,
  activeTimer,
  setActiveTimer,
  setSelectedTask,
  getStatusColor,
  getPriorityColor,
  getClientName,
  setShowNewTaskModal,
}) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [clientFilter, setClientFilter] = useState("All Clients");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || task.status === statusFilter;
      const matchesClient = clientFilter === "All Clients" || getClientName(task.clientId) === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [tasks, searchText, statusFilter, clientFilter, getClientName]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
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
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>All Clients</option>
              {clients.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

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
                        className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 ${
                          activeTimer === task.id
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
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
