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
        timeSlots: Array.isArray(client.timeSlots) ? client.timeSlots : [],
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
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {client ? "Edit Client" : "Add New Client"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              >
                {(() => {
                  const zones = Intl.supportedValuesOf
                    ? Intl.supportedValuesOf('timeZone')
                    : [
                        'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
                        'Europe/London','Europe/Paris','Europe/Berlin','Asia/Manila','Asia/Tokyo',
                        'Asia/Singapore','Asia/Kolkata','Australia/Sydney','Pacific/Auckland',
                      ];
                  const regions = {};
                  zones.forEach(tz => {
                    const region = tz.split('/')[0];
                    if (!regions[region]) regions[region] = [];
                    regions[region].push(tz);
                  });
                  return Object.entries(regions).sort(([a],[b]) => a.localeCompare(b)).map(([region, tzs]) => (
                    <optgroup key={region} label={region.replace(/_/g, ' ')}>
                      {tzs.map(tz => (
                        <option key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate *</label>
              <div className="flex space-x-2">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                >
                  <option value="USD">USD</option>
                  <option value="PHP">PHP</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Frequency</label>
              <select
                value={formData.billing}
                onChange={(e) => setFormData({ ...formData, billing: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-monthly">Bi-monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Project-based">Project-based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projects (comma-separated)</label>
            <input
              type="text"
              value={formData.projects}
              onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              placeholder="Social Media, Content Writing, Data Entry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              placeholder="Additional notes about the client..."
            />
          </div>

          <div className="border-t dark:border-gray-700 pt-4 space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Time Tracking Settings</h4>
            
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Working Time Slots
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Set the client's working hours (e.g., 4:00 AM to 3:00 PM)
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                Times will be converted to GMT+8 (Philippine time) for your schedule
              </div>
              
              <div className="space-y-3">
                {formData.timeSlots && formData.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={slot.start || ""}
                          onChange={(e) => {
                            const newSlots = [...formData.timeSlots];
                            newSlots[index].start = e.target.value;
                            setFormData({ ...formData, timeSlots: newSlots });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                        <input
                          type="time"
                          value={slot.end || ""}
                          onChange={(e) => {
                            const newSlots = [...formData.timeSlots];
                            newSlots[index].end = e.target.value;
                            setFormData({ ...formData, timeSlots: newSlots });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Timezone</label>
                      <select
                        value={slot.tz || "Asia/Manila"}
                        onChange={(e) => {
                          const newSlots = [...formData.timeSlots];
                          newSlots[index].tz = e.target.value;
                          setFormData({ ...formData, timeSlots: newSlots });
                        }}
                        className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      >
                        <option value="Asia/Manila">Philippine Time (GMT+8)</option>
                        <option value="America/New_York">New York (EST/EDT)</option>
                        <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSlots = formData.timeSlots.filter((_, i) => i !== index);
                        setFormData({ ...formData, timeSlots: newSlots });
                      }}
                      className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      timeSlots: [...formData.timeSlots, { start: "04:00", end: "15:00", tz: "Asia/Manila" }]
                    });
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
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
