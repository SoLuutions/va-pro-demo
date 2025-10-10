import React, { useMemo, useState } from 'react';
import { Users, UserPlus, Building2, Plus, UserCog, Shield, Settings, Calendar, LineChart, BarChart3, TrendingUp, Briefcase, ClipboardList, Activity, AlertCircle } from 'lucide-react';

export default function Organization({ clients, tasks, timeEntries, setClients, setTasks, employees, org, addToast }) {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('overview');

  const placeholderClients = useMemo(() => (
    clients.length ? clients : [
      { id: 1, name: 'Acme Corp', projects: ['Website Revamp'], rate: 20 },
      { id: 2, name: 'Bayani Foods', projects: ['Marketing'], rate: 18 },
    ]
  ), [clients]);

  const orgEmployees = useMemo(() => (
    employees.length ? employees : [
      { email: 'owner@example.com', name: 'Org Owner', role: 'Owner' },
      { email: 'lead@example.com', name: 'Team Lead', role: 'Admin' },
      { email: 'member@example.com', name: 'Member One', role: 'Member' },
    ]
  ), [employees]);

  const taskStats = useMemo(() => {
    const byUser = new Map();
    for (const t of tasks) {
      const key = t.assigneeEmail || 'unassigned';
      const stats = byUser.get(key) || { total: 0, completed: 0, minutes: 0 };
      stats.total += 1;
      if (t.status === 'Completed') stats.completed += 1;
      stats.minutes += Math.round((t.timeSpent || 0) * 60);
      byUser.set(key, stats);
    }
    return byUser;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="h-6 w-6" /> {org?.name || 'Your Organization'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Organization view — elevated controls</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 opacity-70 cursor-not-allowed" title="Coming soon">
            <UserPlus className="h-4 w-4" /> Add users (coming soon)
          </button>
          <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 opacity-70 cursor-not-allowed" title="Coming soon">
            <UserCog className="h-4 w-4" /> Manage roles (coming soon)
          </button>
          <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2 opacity-70 cursor-not-allowed" title="Coming soon">
            <Settings className="h-4 w-4" /> Org settings (coming soon)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActive('overview')} className={`px-3 py-1 rounded-md text-sm ${active==='overview'?'bg-blue-600 text-white':'bg-white dark:bg-gray-900 border'}`}>Overview</button>
        <button onClick={() => setActive('team')} className={`px-3 py-1 rounded-md text-sm ${active==='team'?'bg-blue-600 text-white':'bg-white dark:bg-gray-900 border'}`}>Team</button>
        <button onClick={() => setActive('clients')} className={`px-3 py-1 rounded-md text-sm ${active==='clients'?'bg-blue-600 text-white':'bg-white dark:bg-gray-900 border'}`}>Clients</button>
        <button onClick={() => setActive('tasks')} className={`px-3 py-1 rounded-md text-sm ${active==='tasks'?'bg-blue-600 text-white':'bg-white dark:bg-gray-900 border'}`}>Tasks</button>
        <button onClick={() => setActive('analytics')} className={`px-3 py-1 rounded-md text-sm ${active==='analytics'?'bg-blue-600 text-white':'bg-white dark:bg-gray-900 border'}`}>Analytics</button>
      </div>

      {active === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active employees</div>
            <div className="mt-2 text-3xl font-bold">{orgEmployees.length}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active clients</div>
            <div className="mt-2 text-3xl font-bold">{placeholderClients.length}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Open tasks</div>
            <div className="mt-2 text-3xl font-bold">{tasks.filter(t=>t.status!=='Completed').length}</div>
          </div>
        </div>
      )}

      {active === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Team</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search team..." className="pl-8 pr-3 py-2 border rounded-lg w-64 dark:bg-gray-900" />
                <Users className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" />
              </div>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 opacity-70 cursor-not-allowed" title="Coming soon">
                <UserPlus className="h-4 w-4" /> Add user
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgEmployees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())).map(emp => {
              const st = taskStats.get(emp.email) || { total:0, completed:0, minutes:0 };
              const completion = st.total ? Math.round((st.completed/st.total)*100) : 0;
              return (
                <div key={emp.email} className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{emp.role}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Tasks</div>
                      <div className="font-semibold">{st.total}</div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Completed</div>
                      <div className="font-semibold">{st.completed}</div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Hours</div>
                      <div className="font-semibold">{(st.minutes/60).toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Completion rate</div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="h-2 bg-green-500 rounded" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Clients</h3>
            <button onClick={() => addToast && addToast('Client creation coming soon', 'info')} className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Client
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placeholderClients.map(c => (
              <div key={c.id} className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">Rate: ${c.rate}/h</div>
                <div className="mt-2 text-xs text-gray-500">Projects: {c.projects?.join(', ') || 'General'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <button onClick={() => addToast && addToast('Assign task to employee coming soon', 'info')} className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> New Task (assign)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.slice(0,6).map(t => (
              <div key={t.id} className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{t.status}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Client #{t.clientId} • Assignee: {t.assigneeEmail || 'Unassigned'} • {(t.timeSpent||0).toFixed(2)}h
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-6 text-sm text-gray-500 bg-white dark:bg-gray-900 border rounded-lg">No tasks yet. Use normal Tasks tab to add some.</div>
            )}
          </div>
        </div>
      )}

      {active === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500">Overall completion</div>
            <div className="mt-2 text-3xl font-bold">{(() => {
              const total = tasks.length; const done = tasks.filter(t=>t.status==='Completed').length; return total? Math.round((done/total)*100):0;
            })()}%</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500">Avg speed (hrs/task)</div>
            <div className="mt-2 text-3xl font-bold">{(() => {
              const total = tasks.length; const hours = tasks.reduce((a,t)=>a+(t.timeSpent||0),0); return total? (hours/total).toFixed(2):'0.00';
            })()}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="text-sm text-gray-500">Unassigned tasks</div>
            <div className="mt-2 text-3xl font-bold">{tasks.filter(t=>!t.assigneeEmail).length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
