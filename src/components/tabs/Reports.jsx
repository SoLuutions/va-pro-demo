
import React, { useState } from "react";
import { DateTime } from "luxon";
import { Clock, CheckCircle, BarChart3, Building2, Calendar, FileText, Printer } from "lucide-react";

export default function Reports({ clients, tasks, timeEntries }) {
  const [selectedDate, setSelectedDate] = useState(DateTime.now().setZone('Asia/Manila').toISODate());
  
  const totalHours = timeEntries.reduce((s, e) => s + e.duration, 0);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  const clientBreakdown = clients.map((c) => {
    const entries = timeEntries.filter((e) => e.clientId === c.id);
    const hours = entries.reduce((s, e) => s + e.duration, 0);
    const taskCount = tasks.filter((t) => t.clientId === c.id).length;
    return { client: c.name, hours, taskCount };
  }).filter((i) => i.hours > 0);

  const dailyEntries = timeEntries.filter(e => e.date === selectedDate);
  const dailyHours = dailyEntries.reduce((s, e) => s + e.duration, 0);
  
  const dailyClientBreakdown = clients.map((c) => {
    const entries = dailyEntries.filter((e) => e.clientId === c.id);
    const hours = entries.reduce((s, e) => s + e.duration, 0);
    const taskIds = [...new Set(entries.map(e => e.taskId))];
    const clientTasks = tasks.filter(t => taskIds.includes(t.id));
    return { 
      client: c.name, 
      hours, 
      entries: entries.map(e => ({
        ...e,
        task: tasks.find(t => t.id === e.taskId)
      }))
    };
  }).filter((i) => i.hours > 0);

  const handlePrintReport = () => {
    window.print();
  };

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
        <SummaryCard icon={Clock} label="Total Hours" value={`${totalHours.toFixed(1)}h`} />
        <SummaryCard icon={CheckCircle} label="Completed Tasks" value={completedTasks} />
        <SummaryCard icon={BarChart3} label="Total Tasks" value={totalTasks} />
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
                  <p className="text-sm text-gray-500">{item.taskCount} tasks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{item.hours.toFixed(1)}h</p>
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

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Shift Report</h3>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            />
            <button 
              onClick={handlePrintReport}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center space-x-1"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {dailyEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No time entries logged for {DateTime.fromISO(selectedDate).toFormat('MMMM d, yyyy')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {DateTime.fromISO(selectedDate).toFormat('EEEE, MMMM d, yyyy')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {dailyClientBreakdown.length} client{dailyClientBreakdown.length !== 1 ? 's' : ''} • {dailyEntries.length} time entr{dailyEntries.length !== 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{dailyHours.toFixed(2)}h</p>
                    <p className="text-xs text-gray-600">Total hours</p>
                  </div>
                </div>
              </div>

              {dailyClientBreakdown.map((item, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{item.client}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{item.hours.toFixed(2)}h</span>
                      <span className="text-sm text-gray-500 ml-2">({item.entries.length} entr{item.entries.length !== 1 ? 'ies' : 'y'})</span>
                    </div>
                  </div>
                  <div className="divide-y">
                    {item.entries.map((entry, j) => (
                      <div key={j} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{entry.task?.title || 'Unknown Task'}</p>
                            <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">{entry.duration.toFixed(2)}h</p>
                            <p className="text-xs text-gray-500">{(entry.duration * 60).toFixed(0)} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
