import React, { useState, useEffect, useMemo, useCallback } from "react";

export default function CommandPalette({
  isOpen,
  onClose,
  setShowNewTaskModal,
  setShowNewClientModal,
  setActiveTab,
  setShowFocusMode,
  handleStartStop,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = useMemo(() => ([
    { label: "New Task", run: () => setShowNewTaskModal(true) },
    { label: "New Client", run: () => setShowNewClientModal(true) },
    { label: "Go to Dashboard", run: () => setActiveTab("dashboard") },
    { label: "Go to Clients", run: () => setActiveTab("clients") },
    { label: "Go to Tasks", run: () => setActiveTab("tasks") },
    { label: "Go to Time Tracking", run: () => setActiveTab("time") },
    { label: "Go to Reports", run: () => setActiveTab("reports") },
    { label: "Go to Billing", run: () => setActiveTab("billing") },
    { label: "Toggle Focus Mode", run: () => setShowFocusMode((prev) => !prev) },
    { label: "Start/Stop Timer", run: handleStartStop },
    { label: "Open Portfolio", run: () => window.open("https://clarklindleysuan.com/", "_blank") },
  ]), [setShowNewTaskModal, setShowNewClientModal, setActiveTab, setShowFocusMode, handleStartStop]);

  const filteredActions = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return actions.filter((action) => action.label.toLowerCase().includes(lowerQuery));
  }, [actions, query]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen, filteredActions.length]);

  const executeAction = useCallback((action) => {
    action.run();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(filteredActions.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && filteredActions[selectedIndex]) {
        e.preventDefault();
        executeAction(filteredActions[selectedIndex]);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filteredActions, selectedIndex, executeAction, onClose]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24">
      <div className="w-full max-w-xl mx-4 bg-white dark:bg-gray-900 border rounded-xl shadow-xl overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between gap-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command… (New Task, Billing, Go to Clients, Start/Stop)"
            className="w-full px-3 py-2 bg-transparent outline-none text-gray-900 dark:text-gray-100"
          />
          <button onClick={onClose} className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="p-2 divide-y">
          {filteredActions.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
              No commands match your search.
            </div>
          )}
          {filteredActions.map((action, i) => (
            <button
              key={action.label}
              onClick={() => executeAction(action)}
              className={`w-full text-left px-3 py-3 transition-colors ${selectedIndex === i ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
