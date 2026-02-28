import React, { useState, useEffect } from "react";
import { X, FolderOpen } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function TaskModal({ task, tasks, setTasks, timeEntries, setTimeEntries, clients, onClose, templates = [], onSaveTemplate, onApplyTemplate }) {
  if (clients.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No Clients Available</h3>
          <p className="text-gray-600 mb-4">Please add a client before creating tasks.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: clients[0]?.id || 1,
    project: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    billable: true,
    recurring: "None",
    estimatedMin: "",
    allowOverrun: true,
    fileLinks: "",
    outputLinks: "",
    loggedHours: ""
  });

  const [taskType, setTaskType] = useState("Tracked");

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        dueDate: nextWeek.toISOString().split('T')[0],
      }));
    }
  }, [task]);

  const { user } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (taskType === "Completed") {
        // Handle completed task logging
        const newTaskData = {
          title: formData.title,
          description: formData.description,
          clientId: parseInt(formData.clientId),
          priority: formData.priority,
          dueDate: formData.dueDate,
          project: formData.project,
          estimatedMin: formData.estimatedMin,
          allowOverrun: formData.allowOverrun,
          fileLinks: formData.fileLinks,
          outputLinks: formData.outputLinks,
          status: "Completed",
          timeSpent: parseFloat(formData.loggedHours) || 0,
          userId: user.id
        };

        const createdTask = await api.createTask(newTaskData);
        setTasks((prev) => [createdTask, ...prev]);

        const newEntry = {
          taskId: createdTask.id,
          clientId: createdTask.clientId,
          duration: createdTask.timeSpent,
          date: new Date().toISOString().split('T')[0],
          billable: true,
          description: `Manually logged completed task: ${createdTask.title}`,
          userId: user.id
        };
        const createdEntry = await api.createTimeEntry(newEntry);

        if (setTimeEntries) {
          setTimeEntries((prev) => [createdEntry, ...prev]);
        }
      } else {
        // Handle tracked task creation/update
        const taskData = {
          title: formData.title,
          description: formData.description,
          clientId: parseInt(formData.clientId),
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate,
          recurring: formData.recurring,
          project: formData.project,
          estimatedMin: formData.estimatedMin,
          allowOverrun: formData.allowOverrun,
          fileLinks: formData.fileLinks,
          outputLinks: formData.outputLinks,
          userId: user.id
        };

        if (task) {
          const updatedTask = await api.updateTask(task.id, taskData);
          setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        } else {
          const createdTask = await api.createTask({ ...taskData, timeSpent: 0 });
          setTasks((prev) => [createdTask, ...prev]);
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task to database");
    }
  };

  const handleSaveTemplate = () => {
    const tpl = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      project: formData.project,
      priority: formData.priority,
      status: 'To Do',
      billable: formData.billable,
      estimatedMin: formData.estimatedMin,
      allowOverrun: formData.allowOverrun,
      fileLinks: formData.fileLinks,
      outputLinks: formData.outputLinks,
    };
    onSaveTemplate && onSaveTemplate(tpl);
  };

  const selectedClient = clients.find(c => c.id === parseInt(formData.clientId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">
            {task ? "Edit Task" : "Create New Task"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!task && (
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setTaskType("Tracked")}
                className={`py-2 px-4 rounded-lg flex-1 text-sm font-medium border ${taskType === 'Tracked' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              >
                Track Time Task
              </button>
              <button
                type="button"
                onClick={() => setTaskType("Completed")}
                className={`py-2 px-4 rounded-lg flex-1 text-sm font-medium border ${taskType === 'Completed' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              >
                Log Completed Task
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Create social media content calendar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project/Category</label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={selectedClient?.projects?.[0] || "Project name"}
              />
            </div>

            {taskType === "Tracked" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date / Completion Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
              <select
                value={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Task Settings</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskType === "Tracked" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedMin || ""}
                      onChange={(e) => setFormData({ ...formData, estimatedMin: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="120 (2 hours)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Timer will count down from this</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="billable"
                        checked={formData.billable}
                        onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="billable" className="ml-2 block text-sm text-gray-700">
                        Billable task
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowOverrun"
                        checked={formData.allowOverrun !== false}
                        onChange={(e) => setFormData({ ...formData, allowOverrun: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowOverrun" className="ml-2 block text-sm text-gray-700">
                        Allow continuing past estimated time
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logged Time (hours) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.loggedHours || ""}
                    onChange={(e) => setFormData({ ...formData, loggedHours: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total time spent on this completed task</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Files & Output</h4>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  File Links
                </label>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <FolderOpen className="h-3 w-3" />
                  <span>Open Google Drive</span>
                </a>
              </div>
              <textarea
                value={formData.fileLinks || ""}
                onChange={(e) => setFormData({ ...formData, fileLinks: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add links to Google Drive, Dropbox, or other storage (one per line)&#10;https://drive.google.com/file/...&#10;https://www.dropbox.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Enter file links (one per line)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Links
              </label>
              <textarea
                value={formData.outputLinks || ""}
                onChange={(e) => setFormData({ ...formData, outputLinks: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add links to completed work output (one per line)&#10;https://drive.google.com/file/...&#10;https://www.dropbox.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Enter output links (one per line)</p>
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
              {task ? "Update Task" : "Create Task"}
            </button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={handleSaveTemplate} className="text-sm text-blue-600 hover:underline">Save as template</button>
            {templates.length > 0 && (
              <select
                className="text-sm border rounded px-2 py-1"
                onChange={(e) => {
                  const tpl = templates.find(t => t.id === parseInt(e.target.value));
                  if (!tpl) return;
                  onApplyTemplate && onApplyTemplate(tpl);
                  setFormData(prev => ({
                    ...prev,
                    ...tpl,
                    clientId: prev.clientId,
                    status: 'To Do'
                  }));
                }}
              >
                <option value="">Apply template…</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
