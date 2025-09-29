
import React from "react";
import { Plus, Clock, CheckCircle, Calendar, DollarSign, Building2, Edit, Trash2 } from "lucide-react";

export default function TimeTracking({
  clients,
  tasks,
  timeEntries,
  activeTimer,
  timerSeconds,
  formatTime,
  getClientName,
  formatCurrency,
  stopTimerAndLog,
}) {
  const TODAY = "2025-09-26";
  const todayEntries = timeEntries.filter((e) => e.date === TODAY);
  const weekEntries = timeEntries.filter((e) => {
    const entryDate = new Date(e.date);
    const today = new Date(TODAY);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return entryDate >= weekStart && entryDate <= today;
  });

  const totalHoursToday = todayEntries.reduce((s, e) => s + e.duration, 0);
  const billableToday = todayEntries.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  const earnedToday = todayEntries.filter((e) => e.billable).reduce((s, e) => {
    const client = clients.find((c) => c.id === e.clientId);
    return s + e.duration * (client?.rate || 0);
  }, 0);
  const totalWeek = weekEntries.reduce((s, e) => s + e.duration, 0);

  const activeTask = tasks.find((t) => t.id === activeTimer);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard icon={Clock} label="Today Total" value={`${totalHoursToday.toFixed(1)}h`} color="blue" />
        <SummaryCard icon={CheckCircle} label="Billable Today" value={`${billableToday.toFixed(1)}h`} color="green" />
        <SummaryCard icon={Calendar} label="Week Total" value={`${totalWeek.toFixed(1)}h`} color="purple" />
        <SummaryCard icon={DollarSign} label="Earned Today" value={formatCurrency(earnedToday)} color="yellow" />
      </div>

      {activeTask && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Timer Running</h3>
              <p className="text-gray-600">{activeTask.title}</p>
              <p className="text-sm text-gray-500">{getClientName(activeTask.clientId)}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-4xl font-mono font-bold text-blue-600">{formatTime(timerSeconds)}</div>
                <p className="text-sm text-gray-500">Current Session</p>
              </div>
              <button onClick={stopTimerAndLog} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2">
                <span>■</span>
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
          <div className="flex space-x-2">
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <select className="px-3 py-1 border rounded-lg text-sm">
              <option>All Clients</option>
              {clients.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="divide-y">
          {timeEntries.slice().reverse().map((entry) => {
            const task = tasks.find((t) => t.id === entry.taskId);
            const client = clients.find((c) => c.id === entry.clientId);
            return (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{task?.title || "Manual Entry"}</h4>
                      {entry.billable ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Billable</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Non-billable</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {client?.name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {entry.date}
                      </span>
                      {entry.billable && (
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(entry.duration * (client?.rate || 0))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{entry.duration}h</div>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className={`h-6 w-6`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
