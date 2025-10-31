import React from 'react';

export default function Landing({ onGetStarted, onGoToLogin, onGoToRegister }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-white dark:from-[#0B1120] dark:to-[#0B1120]">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full nava-focus-gradient" />
          <span className="text-xl font-bold font-outfit text-gray-900 dark:text-gray-100">NaVA</span>
        </div>
        <div className="space-x-3">
          <button onClick={onGoToLogin} className="px-4 py-2 text-primary bg-white dark:bg-gray-900 border rounded-lg hover:bg-gray-50">Log in</button>
          <button onClick={onGoToRegister} className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">Sign up</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="font-manrope text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            NaVA — Virtual Assistant Navigator
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 font-inter">
            Navigate your workday. Manage clients, track time, and stay focused with calm guidance.
          </p>
          <div className="mt-6 flex space-x-3">
            <button onClick={onGetStarted} className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90">Get Started</button>
            <button onClick={onGoToRegister} className="px-6 py-3 bg-white dark:bg-gray-900 border rounded-lg text-primary hover:bg-gray-50">Create an account</button>
          </div>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 dark:text-gray-200">
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Time tracking with daily limits</li>
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Client and project management</li>
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Dashboard with compass-like focus cues</li>
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Reports and billing overview</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-lg">
          <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Focus Mode</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stay on task</p>
            </div>
            <div className="p-4 rounded bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Quick Links</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Jump faster</p>
            </div>
          </div>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-soft text-brand text-sm font-medium">Coming Soon</div>
          <h2 className="mt-4 font-manrope text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Organization features for teams
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Built for clients and small–medium businesses managing their VAs.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-200">
            <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
              <p className="font-semibold">Team dashboard</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">See all VAs, tasks, and timers at a glance.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
              <p className="font-semibold">Roles & permissions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Owners, managers, and client-level access.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
              <p className="font-semibold">Approvals & limits</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approve hours, enforce budgets and daily caps.</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="px-5 py-2 rounded-lg bg-primary text-white hover:opacity-90">Join the waitlist</button>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Clark Lindley Suan. All rights reserved.</p>
        <p>Contact: <a className="text-primary" href="mailto:clarklindleysuan@gmail.com">clarklindleysuan@gmail.com</a> · <a className="text-primary" href="https://clark-lindley-suan.vercel.app" target="_blank" rel="noreferrer">clark-lindley-suan.vercel.app</a></p>
      </footer>
    </div>
  );
}


