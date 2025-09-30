import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ClientModal({ client, clients, setClients, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "",
    location: "",
    rate: "",
    currency: "USD",
    billing: "Monthly",
    notes: "",
    projects: "",
    status: "Active",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        projects: Array.isArray(client.projects) ? client.projects.join(", ") : "",
      });
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newClient = {
      id: client ? client.id : Date.now(),
      ...formData,
      rate: parseFloat(formData.rate) || 0,
      projects: formData.projects.split(",").map(p => p.trim()).filter(Boolean),
      totalHours: client?.totalHours || 0,
      lastActivity: client?.lastActivity || "Just now",
    };

    if (client) {
      setClients(clients.map(c => c.id === client.id ? newClient : c));
    } else {
      setClients([...clients, newClient]);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">
            {client ? "Edit Client" : "Add New Client"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PST (UTC-8)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate *</label>
              <div className="flex space-x-2">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="PHP">PHP</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="15.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Frequency</label>
              <select
                value={formData.billing}
                onChange={(e) => setFormData({ ...formData, billing: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-monthly">Bi-monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Project-based">Project-based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projects (comma-separated)</label>
            <input
              type="text"
              value={formData.projects}
              onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Social Media, Content Writing, Data Entry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the client..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {client ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
