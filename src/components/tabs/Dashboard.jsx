
import React, { useState, useEffect, useMemo } from "react";
import { DateTime } from "luxon";
import { Timer, CheckCircle, Users, Square, ListChecks, ExternalLink, Video, MessageSquare, FolderOpen, Globe, Calendar, Clock, Plus, X, Edit2 } from "lucide-react";

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
  stopTimerAndLog,
  quickLinks = [],
  setQuickLinks,
}) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ name: "", url: "", icon: "link" });
  const TODAY = DateTime.now().setZone('Asia/Manila').toISODate();
  const totalHoursToday = timeEntries.filter((e) => e.date === TODAY).reduce((s, e) => s + e.duration, 0);
  const activeTasksCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const activeTask = tasks.find((t) => t.id === activeTimer);

  // Clock & seasonal greeting
  const [now, setNow] = useState(DateTime.now());
  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = useMemo(() => {
    const hour = now.hour;
    let base = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const month = now.month;
    const seasonal = (
      month === 12 ? ' Happy Holidays!' :
      month === 1 ? ' Welcome to the new year!' :
      month >= 2 && month <= 3 ? ' Stay inspired this season.' :
      month >= 4 && month <= 5 ? ' Fresh starts and focus.' :
      month >= 6 && month <= 8 ? ' Stay cool and productive.' :
      month >= 9 && month <= 11 ? ' Finishing strong this year.' : ''
    );
    return base + seasonal;
  }, [now]);

  // Currency converter
  const [rates, setRates] = useState(null);
  const [base, setBase] = useState('USD');
  const [amount, setAmount] = useState(1);
  const supported = ['USD','PHP','EUR','GBP','AUD','CAD'];
  const clientCurrencies = Array.from(new Set(clients.map(c => c.currency).filter(c => supported.includes(c))));

  useEffect(() => {
    const symbols = supported.filter(s => s !== base).join(',');
    fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`)
      .then(r => r.json())
      .then(d => setRates(d.rates))
      .catch(() => setRates(null));
  }, [base]);

  const getIconComponent = (iconName) => {
    const icons = {
      video: Video,
      message: MessageSquare,
      folder: FolderOpen,
      globe: Globe,
      calendar: Calendar,
      link: ExternalLink
    };
    const IconComp = icons[iconName] || ExternalLink;
    return <IconComp className="h-5 w-5" />;
  };

  const handleAddLink = () => {
    setLinkForm({ name: "", url: "", icon: "link" });
    setEditingLink(null);
    setShowLinkModal(true);
  };

  const handleEditLink = (link) => {
    setLinkForm(link);
    setEditingLink(link.id);
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!linkForm.name || !linkForm.url) return;
    
    if (editingLink) {
      setQuickLinks(quickLinks.map(l => l.id === editingLink ? { ...linkForm, id: editingLink } : l));
    } else {
      setQuickLinks([...quickLinks, { ...linkForm, id: Date.now() }]);
    }
    setShowLinkModal(false);
  };

  const handleDeleteLink = (id) => {
    setQuickLinks(quickLinks.filter(l => l.id !== id));
  };

  const clientTimezones = clients.map(c => ({
    name: c.name,
    timezone: c.timezone || 'America/New_York',
    currentTime: DateTime.now().setZone(c.timezone || 'America/New_York')
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{now.toFormat('cccc, LLL d')}</p>
          <h2 className="text-2xl font-bold text-gray-900">{greeting}</h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-semibold text-blue-600">{now.toFormat('hh:mm:ss a')}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card icon={<Timer className="h-6 w-6 text-blue-600" />} label="Hours Today" value={totalHoursToday.toFixed(1)} color="bg-blue-100" />
        <Card icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Active Tasks" value={activeTasksCount} color="bg-green-100" />
        <Card icon={<Users className="h-6 w-6 text-purple-600" />} label="Active Clients" value={clients.length} color="bg-purple-100" />
        <Card icon={<ListChecks className="h-6 w-6 text-indigo-600" />} label="Completed Tasks" value={completedTasksCount} color="bg-indigo-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <button
              onClick={handleAddLink}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Add Link"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            {quickLinks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No quick links added yet. Click + to add one!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickLinks.map(link => (
                  <div key={link.id} className="group relative">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm mb-2">
                        {getIconComponent(link.icon)}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center truncate w-full">{link.name}</span>
                    </a>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={() => handleEditLink(link)}
                        className="p-1 bg-white rounded shadow hover:bg-gray-100"
                      >
                        <Edit2 className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1 bg-white rounded shadow hover:bg-red-50"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Client Timezones</h3>
          </div>
          <div className="p-4">
            {clients.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No clients added yet</p>
            ) : (
              <div className="space-y-3">
                {clientTimezones.map((ct, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{ct.name}</p>
                      <p className="text-xs text-gray-500">{ct.timezone.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{ct.currentTime.toFormat('h:mm a')}</p>
                      <p className="text-xs text-gray-500">{ct.currentTime.toFormat('MMM d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
          <div className="flex items-center space-x-2">
            <select value={base} onChange={(e) => setBase(e.target.value)} className="border rounded px-2 py-1">
              {supported.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="border rounded px-2 py-1 w-28" />
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {rates ? (
            [...new Set(['PHP', ...clientCurrencies.filter(c => c !== base), ...supported.filter(s => s !== base)])]
              .slice(0, 6)
              .map(code => (
                <div key={code} className="p-3 bg-gray-50 rounded border text-center">
                  <div className="text-xs text-gray-500">{base} → {code}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {(amount * (rates[code] || 0)).toFixed(2)}
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-center text-gray-500">Rates unavailable</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calendar Sync</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Connect your calendar to sync tasks and deadlines</p>
          <div className="flex justify-center space-x-3">
            <button className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Connect Google Calendar</span>
            </button>
            <button className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Connect Outlook</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Calendar integration coming soon!</p>
        </div>
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

      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLink ? 'Edit Link' : 'Add Quick Link'}
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={linkForm.name}
                  onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Zoom, Slack, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select
                  value={linkForm.icon}
                  onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="link">Link</option>
                  <option value="video">Video (Zoom)</option>
                  <option value="message">Message (Slack)</option>
                  <option value="folder">Folder (Drive)</option>
                  <option value="globe">Globe (Website)</option>
                  <option value="calendar">Calendar</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
