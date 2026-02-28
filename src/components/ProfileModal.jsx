import React, { useState } from 'react';
import { X, Moon, Sun, Shield, Lock, Trash2, Edit2, Check, Download, Upload } from 'lucide-react';
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import STORAGE_KEYS, { loadFromStorage, clearAllStorage, saveToStorage } from "../utils/localStorage";

export default function ProfileModal({ profile, onSave, onClose, uiSettings, onUpdateUiSettings }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
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

  const handleMigrateData = async () => {
    if (!window.confirm("This will upload all your local browser data (clients, tasks, time entries) to the Supabase database. Are you sure you want to proceed?")) {
      return;
    }

    try {
      setIsMigrating(true);
      setMigrationStatus('Reading local storage...');

      const localClients = loadFromStorage(STORAGE_KEYS.CLIENTS, []);
      const localTasks = loadFromStorage(STORAGE_KEYS.TASKS, []);
      const localTimeEntries = loadFromStorage(STORAGE_KEYS.TIME_ENTRIES, []);

      // 1. Migrate Clients
      setMigrationStatus(`Migrating ${localClients.length} clients...`);
      const clientMap = {}; // old_id -> new_id
      for (const client of localClients) {
        const payload = {
          name: client.name,
          email: client.email,
          phone: client.phone,
          timezone: client.timezone,
          location: client.location,
          rate: client.rate,
          currency: client.currency,
          billing: client.billing,
          notes: client.notes,
          projects: Array.isArray(client.projects) ? client.projects : [],
          status: client.status,
          daily_time_limit_min: client.dailyTimeLimitMin,
          user_id: user.id
        };
        const newClient = await api.createClient(payload);
        clientMap[client.id] = newClient.id;
      }

      // 2. Migrate Tasks
      setMigrationStatus(`Migrating ${localTasks.length} tasks...`);
      const taskMap = {}; // old_id -> new_id
      for (const task of localTasks) {
        const payload = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          client_id: clientMap[task.clientId],
          due_date: task.dueDate,
          time_spent: task.timeSpent,
          recurring: task.recurring,
          estimated_min: task.estimatedMin,
          allow_overrun: task.allowOverrun,
          file_links: task.fileLinks,
          output_links: task.outputLinks,
          user_id: user.id
        };
        if (payload.client_id) { // Only migrate tasks that have valid clients
          const newTask = await api.createTask({
            ...payload,
            clientId: payload.client_id,
            dueDate: payload.due_date,
            timeSpent: payload.time_spent,
            estimatedMin: payload.estimated_min,
            allowOverrun: payload.allow_overrun,
            fileLinks: payload.file_links,
            outputLinks: payload.output_links,
            userId: user.id
          });
          taskMap[task.id] = newTask.id;
        }
      }

      // 3. Migrate Time Entries
      setMigrationStatus(`Migrating ${localTimeEntries.length} time entries...`);
      for (const entry of localTimeEntries) {
        if (taskMap[entry.taskId] && clientMap[entry.clientId]) {
          await api.createTimeEntry({
            taskId: taskMap[entry.taskId],
            clientId: clientMap[entry.clientId],
            duration: entry.duration,
            date: entry.date,
            billable: entry.billable,
            description: entry.description,
            userId: user.id
          });
        }
      }

      setMigrationStatus('Migration complete! Refreshing application...');
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.TIME_ENTRIES);

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Migration failed:", error);
      setMigrationStatus(`Error during migration: ${error.message}`);
      setIsMigrating(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'security', label: 'Privacy & Security' },
    { id: 'data', label: 'Data Management' }
  ];

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

          <div className="pt-6 border-t mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Cloud Migration</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Migrate Local Data to Supabase</h5>
              <p className="text-sm text-blue-800 mb-4">
                Move your offline local storage data (clients, tasks, time entries) into the cloud database so you can access it anywhere.
              </p>
              <button
                type="button"
                onClick={handleMigrateData}
                disabled={isMigrating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{isMigrating ? 'Migrating...' : 'Start Migration'}</span>
              </button>
              {migrationStatus && (
                <p className="mt-2 text-xs font-semibold text-blue-700">{migrationStatus}</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Danger Zone</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-red-900 mb-2">Clear All Local Data</h5>
              <p className="text-sm text-red-800 mb-4">
                This will permanently delete all your local data (clients, tasks, time entries) from your browser's storage. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear ALL local data? This action is irreversible.")) {
                    clearAllStorage();
                    window.location.reload();
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">NDA mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hide sensitive names/amounts for screen sharing</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateUiSettings({ ...uiSettings, ndaMode: !uiSettings.ndaMode })}
                className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {uiSettings.ndaMode ? 'On' : 'Off'}
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
