
import React from "react";
import { Plus, Building2, Mail, MapPin, Globe } from "lucide-react";

export default function Clients({ clients, setSelectedClient, setShowNewClientModal }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
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
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.status}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {client.currency} {client.rate}/hr
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {client.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {client.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                {client.timezone}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Hours:</span>
                <span className="font-medium">{client.totalHours}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Last Activity:</span>
                <span className="text-gray-900">{client.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
