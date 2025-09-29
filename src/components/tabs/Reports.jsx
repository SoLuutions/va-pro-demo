
import React from "react";
import { Clock, DollarSign, BarChart3, Building2 } from "lucide-react";

export default function Reports({ clients, tasks, timeEntries, formatCurrency }) {
  const totalHours = timeEntries.reduce((s, e) => s + e.duration, 0);
  const totalEarnings = timeEntries.filter((e) => e.billable).reduce((s, e) => {
    const c = clients.find((cl) => cl.id === e.clientId);
    return s + e.duration * (c?.rate || 0);
  }, 0);
  const avgRate = totalHours ? totalEarnings / totalHours : 0;

  const clientBreakdown = clients.map((c) => {
    const entries = timeEntries.filter((e) => e.clientId === c.id);
    const hours = entries.reduce((s, e) => s + e.duration, 0);
    const earnings = entries.filter((e) => e.billable).reduce((s, e) => s + e.duration * c.rate, 0);
    return { client: c.name, hours, earnings, rate: c.rate };
  }).filter((i) => i.hours > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <select className="px-4 py-2 border rounded-lg">
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard icon={Clock} label="Total Hours" value={`${totalHours.toFixed(1)}`} />
        <SummaryCard icon={DollarSign} label="Total Earnings" value={formatCurrency(totalEarnings)} />
        <SummaryCard icon={BarChart3} label="Avg. Rate" value={formatCurrency(avgRate)} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Time by Client</h3>
        </div>
        <div className="p-6 space-y-4">
          {clientBreakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.client}</h4>
                  <p className="text-sm text-gray-500">{formatCurrency(item.rate)}/hour</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{item.hours.toFixed(1)}h</p>
                <p className="text-sm text-green-600">{formatCurrency(item.earnings)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Task Performance</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <TaskStat label="Completed" value={tasks.filter((t) => t.status === "Completed").length} color="green" />
          <TaskStat label="In Progress" value={tasks.filter((t) => t.status === "In Progress").length} color="blue" />
          <TaskStat label="Review" value={tasks.filter((t) => t.status === "Review").length} color="yellow" />
          <TaskStat label="To Do" value={tasks.filter((t) => t.status === "To Do").length} color="gray" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function TaskStat({ label, value, color }) {
  const colors = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    gray: "text-gray-600",
  };
  return (
    <div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
