import React, { useEffect, useMemo } from "react";

export default function CommandPalette({
  isOpen,
  onClose,
  setShowNewTaskModal,
  setShowNewClientModal,
  setActiveTab,
  handleStartStop,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = useMemo(() => ([
    { label: 'New Task', run: () => setShowNewTaskModal(true) },
    { label: 'New Client', run: () => setShowNewClientModal(true) },
    { label: 'Go to Dashboard', run: () => setActiveTab('dashboard') },
    { label: 'Go to Clients', run: () => setActiveTab('clients') },
    { label: 'Go to Tasks', run: () => setActiveTab('tasks') },
    { label: 'Go to Billing', run: () => setActiveTab('billing') },
    { label: 'Start/Stop Timer', run: handleStartStop },
  ]), [setShowNewTaskModal, setShowNewClientModal, setActiveTab, handleStartStop]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24">
      <div className="w-full max-w-xl mx-4 bg-white dark:bg-gray-900 border rounded-xl shadow-xl overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <input
            autoFocus
            placeholder="Type a command… (New Task, Billing, Start/Stop)"
            className="w-full px-3 py-2 bg-transparent outline-none text-gray-900 dark:text-gray-100"
          />
          <button onClick={onClose} className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="p-2 divide-y">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={() => { a.run(); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
