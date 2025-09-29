
import React from "react";
import { Timer, CheckCircle, Users, DollarSign, Square } from "lucide-react";

export default function Dashboard({
  clients,
  tasks,
  timeEntries,
  activeTimer,
  timerSeconds,
  formatTime,
  getStatusColor,
  getPriorityColor,
  getClientName,
  formatCurrency,
  stopTimerAndLog,
}) {
  const TODAY = "2025-09-26";
  const totalHoursToday = timeEntries.filter((e) => e.date === TODAY).reduce((s, e) => s + e.duration, 0);
  const activeTasksCount = tasks.filter((t) => t.status === "In Progress").length;
  const totalEarningsToday = timeEntries
    .filter((e) => e.date === TODAY && e.billable)
    .reduce((sum, e) => {
      const client = clients.find((c) => c.id === e.clientId);
      return sum + e.duration * (client?.rate || 0);
    }, 0);
  const activeTask = tasks.find((t) => t.id === activeTimer);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card icon={<Timer className="h-6 w-6 text-blue-600" />} label="Hours Today" value={totalHoursToday.toFixed(1)} color="bg-blue-100" />
        <Card icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Active Tasks" value={activeTasksCount} color="bg-green-100" />
        <Card icon={<Users className="h-6 w-6 text-purple-600" />} label="Active Clients" value={clients.length} color="bg-purple-100" />
        <Card icon={<DollarSign className="h-6 w-6 text-yellow-600" />} label="Earnings Today" value={formatCurrency(totalEarningsToday)} color="bg-yellow-100" />
      </div>

      {activeTask && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Timer</h3>
              <p className="text-gray-600">{activeTask.title}</p>
              <p className="text-sm text-gray-500">{getClientName(activeTask.clientId)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(timerSeconds)}</div>
              <button onClick={stopTimerAndLog} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2">
                <Square className="h-4 w-4" />
                <span>Stop & Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
        </div>
        <div className="divide-y">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-500">{getClientName(task.clientId)} • {task.project}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                <span className="text-sm text-gray-500">{task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
