import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function ProfileModal({ profile, onSave, onClose, uiSettings, onUpdateUiSettings }) {
  const { seedDemoData } = useAppData();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    timezone: profile?.timezone || 'Asia/Manila',
    avatarUrl: profile?.avatarUrl || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your profile to a blank slate? This cannot be undone.')) {
      setFormData({
        name: '',
        email: '',
        timezone: 'Asia/Manila',
        avatarUrl: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Profile & Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="pt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UI Accent Theme
              </label>
              <select
                value={uiSettings.theme || (uiSettings.darkMode ? "dark" : "blue")}
                onChange={(e) => {
                  const val = e.target.value;
                  const isDark = val === "dark" || val === "green-dark" || val === "red-dark";
                  onUpdateUiSettings({
                    ...uiSettings,
                    theme: val,
                    darkMode: isDark
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="blue">Classic Blue</option>
                <option value="dark">Ocean Dark</option>
                <option value="green">Green Theme</option>
                <option value="green-dark">Green Dark</option>
                <option value="red">Red Theme</option>
                <option value="red-dark">Red Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">NDA mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hide sensitive names/amounts for screen sharing</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateUiSettings({ ...uiSettings, ndaMode: !uiSettings.ndaMode })}
                className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                {uiSettings.ndaMode ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between border-t pt-3 border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Seed Demo Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Populate the app with realistic mock clients and tasks</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  seedDemoData();
                  onClose();
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
              >
                Seed Data
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
