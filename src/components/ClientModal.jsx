import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ClientModal({ client, clients, setClients, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    timezone: "America/New_York",
    location: "",
    rate: "",
    currency: "USD",
    billing: "Monthly",
    notes: "",
    projects: "",
    status: "Active",
    dailyTimeLimitMin: "",
    timeSlots: [],
    enforceTimeSlots: false
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
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="North America">
                  <option value="America/New_York">America/New York (EST/EDT)</option>
                  <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                  <option value="America/Denver">America/Denver (MST/MDT)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                  <option value="America/Toronto">America/Toronto (EST/EDT)</option>
                  <option value="America/Vancouver">America/Vancouver (PST/PDT)</option>
                  <option value="America/Phoenix">America/Phoenix (MST)</option>
                  <option value="America/Anchorage">America/Anchorage (AKST/AKDT)</option>
                  <option value="America/Halifax">America/Halifax (AST/ADT)</option>
                  <option value="America/Mexico_City">America/Mexico City (CST/CDT)</option>
                </optgroup>
                <optgroup label="Western Europe">
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Dublin">Europe/Dublin (GMT/IST)</option>
                  <option value="Europe/Lisbon">Europe/Lisbon (GMT/WEST)</option>
                  <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                  <option value="Europe/Amsterdam">Europe/Amsterdam (CET/CEST)</option>
                  <option value="Europe/Brussels">Europe/Brussels (CET/CEST)</option>
                  <option value="Europe/Madrid">Europe/Madrid (CET/CEST)</option>
                  <option value="Europe/Rome">Europe/Rome (CET/CEST)</option>
                  <option value="Europe/Zurich">Europe/Zurich (CET/CEST)</option>
                  <option value="Europe/Vienna">Europe/Vienna (CET/CEST)</option>
                </optgroup>
                <optgroup label="Australia & New Zealand">
                  <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                  <option value="Australia/Melbourne">Australia/Melbourne (AEST/AEDT)</option>
                  <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                  <option value="Australia/Perth">Australia/Perth (AWST)</option>
                  <option value="Australia/Adelaide">Australia/Adelaide (ACST/ACDT)</option>
                  <option value="Australia/Darwin">Australia/Darwin (ACST)</option>
                  <option value="Pacific/Auckland">Pacific/Auckland (NZST/NZDT)</option>
                </optgroup>
                <optgroup label="More Timezones">
                  <option value="Asia/Manila">Asia/Manila (PHT - GMT+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST - GMT+9)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT - GMT+8)</option>
                  <option value="Asia/Hong_Kong">Asia/Hong Kong (HKT - GMT+8)</option>
                  <option value="Asia/Shanghai">Asia/Shanghai (CST - GMT+8)</option>
                  <option value="Asia/Seoul">Asia/Seoul (KST - GMT+9)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST - GMT+4)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - GMT+5:30)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (ICT - GMT+7)</option>
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB - GMT+7)</option>
                  <option value="Europe/Istanbul">Europe/Istanbul (TRT - GMT+3)</option>
                  <option value="Europe/Moscow">Europe/Moscow (MSK - GMT+3)</option>
                  <option value="Europe/Athens">Europe/Athens (EET/EEST)</option>
                  <option value="Europe/Helsinki">Europe/Helsinki (EET/EEST)</option>
                  <option value="Europe/Stockholm">Europe/Stockholm (CET/CEST)</option>
                  <option value="Europe/Copenhagen">Europe/Copenhagen (CET/CEST)</option>
                  <option value="Europe/Oslo">Europe/Oslo (CET/CEST)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST - GMT+2)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT - GMT+1)</option>
                  <option value="America/Sao_Paulo">America/São Paulo (BRT - GMT-3)</option>
                  <option value="America/Buenos_Aires">America/Buenos Aires (ART - GMT-3)</option>
                  <option value="America/Lima">America/Lima (PET - GMT-5)</option>
                  <option value="America/Bogota">America/Bogota (COT - GMT-5)</option>
                  <option value="Pacific/Honolulu">Pacific/Honolulu (HST - GMT-10)</option>
                  <option value="Pacific/Fiji">Pacific/Fiji (FJT - GMT+12)</option>
                </optgroup>
              </select>
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

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Time Tracking Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dailyTimeLimitMin || ""}
                  onChange={(e) => setFormData({ ...formData, dailyTimeLimitMin: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="240 (4 hours)"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no limit</p>
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="enforceTimeSlots"
                  checked={formData.enforceTimeSlots || false}
                  onChange={(e) => setFormData({ ...formData, enforceTimeSlots: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enforceTimeSlots" className="ml-2 block text-sm text-gray-700">
                  Enforce time slots (block timer outside hours)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Time Slots (in client's timezone)
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Example: 8am-4pm for an 8-hour workday
              </div>
              <div className="text-xs text-blue-600 mb-2">
                Times will be converted to GMT+8 for your schedule
              </div>
            </div>
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
