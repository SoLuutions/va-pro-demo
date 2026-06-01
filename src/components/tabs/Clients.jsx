import React, { useState } from "react";
import { Plus, Building2, Mail, MapPin, Globe, Trash2 } from "lucide-react";

export default function Clients({ clients, tasks, timeEntries, setSelectedClient, setShowNewClientModal, setClients, setTasks, setTimeEntries, uiSettings }) {
  const handleDeleteClient = (clientId) => {
    // Remove client
    setClients(prev => prev.filter(c => c.id !== clientId));
    // Remove tasks for this client
    setTasks(prev => prev.filter(t => t.clientId !== clientId));
    // Remove time entries for this client
    setTimeEntries(prev => prev.filter(e => e.clientId !== clientId));
  };
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
        {clients.map((client) => (
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
                  <p className={`text-sm ${uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{client.status}</p>
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
                  title="Delete client"
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
                <span className={`font-medium ${uiSettings?.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{client.totalHours}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className={uiSettings?.darkMode ? 'text-gray-400' : 'text-gray-600'}>Last Activity:</span>
                <span className={uiSettings?.darkMode ? 'text-gray-100' : 'text-gray-900'}>{client.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
