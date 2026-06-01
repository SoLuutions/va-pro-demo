import React from "react";
import { Plus, Building2, Mail, MapPin, Globe, Trash2, RotateCcw } from "lucide-react";

export default function Clients({ clients, tasks, timeEntries, setSelectedClient, setShowNewClientModal, setClients, setTasks, setTimeEntries, uiSettings }) {
  const activeClients = clients.filter((client) => !client.deletedAt);
  const trashedClients = clients.filter((client) => client.deletedAt);

  const getClientTotalHours = (clientId) =>
    timeEntries
      .filter((entry) => entry.clientId === clientId)
      .reduce((total, entry) => total + (Number(entry.duration) || 0), 0);

  const getClientLastActivity = (clientId) => {
    const entries = timeEntries
      .filter((entry) => entry.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastEntry = entries[0];
    if (lastEntry?.date) {
      return new Date(lastEntry.date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const relevantTasks = tasks
      .filter((task) => task.clientId === clientId && task.dueDate)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return relevantTasks[0]?.dueDate
      ? new Date(relevantTasks[0].dueDate).toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No activity";
  };

  const handleDeleteClient = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const confirmed = confirm(`Delete ${client.name}? This will move the client to trash for 2 days and can be recovered during that time.`);
    if (!confirmed) return;

    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, deletedAt: new Date().toISOString() } : c)));
  };

  const handleRestoreClient = (clientId) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, deletedAt: undefined } : c)));
  };

  const formatHours = (hours) => `${hours.toFixed(1)}h`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Management</h2>
        <button
          onClick={() => setShowNewClientModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeClients.length === 0 ? (
          <div className="col-span-full p-8 rounded-xl border border-dashed text-center text-gray-500 dark:text-gray-400">
            No active clients yet. Add a client to get started.
          </div>
        ) : (
          activeClients.map((client) => {
            const hours = getClientTotalHours(client.id);
            const lastActivity = getClientLastActivity(client.id);
            return (
              <div
                key={client.id}
                className={`p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${uiSettings?.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white border-gray-200'}`}
                onClick={() => {
                  setSelectedClient(client);
                  setShowNewClientModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${uiSettings?.darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                      <Building2 className={`h-6 w-6 ${uiSettings?.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${uiSettings?.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{client.name}</h3>
                      <p className={`text-sm ${uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{client.status || "Active"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${uiSettings?.darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      {client.currency} {client.rate}/hr
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className={`p-1 rounded ${uiSettings?.darkMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                      title="Move to trash"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className={`flex items-center text-sm ${uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </div>
                  <div className={`flex items-center text-sm ${uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {client.location}
                  </div>
                  <div className={`flex items-center text-sm ${uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Globe className="h-4 w-4 mr-2" />
                    {client.timezone}
                  </div>
                </div>

                <div className={`pt-4 border-t ${uiSettings?.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Hours:</span>
                    <span className={`font-medium ${uiSettings?.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatHours(hours)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className={uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Last Activity:</span>
                    <span className={uiSettings?.darkMode ? 'text-gray-100' : 'text-gray-900'}>{lastActivity}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {trashedClients.length > 0 && (
        <div className="rounded-xl border p-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Deleted clients</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recover within 2 days before the client is permanently removed.</p>
            </div>
          </div>
          <div className="space-y-4">
            {trashedClients.map((client) => {
              const deletedAt = client.deletedAt ? new Date(client.deletedAt).getTime() : 0;
              const remainingMs = Math.max(0, 2 * 24 * 60 * 60 * 1000 - (Date.now() - deletedAt));
              const daysLeft = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
              return (
                <div key={client.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{client.email} · Recover in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
                  </div>
                  <button
                    onClick={() => handleRestoreClient(client.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
