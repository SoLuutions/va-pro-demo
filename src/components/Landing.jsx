import React from 'react';

export default function Landing({ onGetStarted, onGoToLogin, onGoToRegister }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">VA Pro</span>
        </div>
        <div className="space-x-3">
          <button onClick={onGoToLogin} className="px-4 py-2 text-blue-600 bg-white dark:bg-gray-900 border rounded-lg hover:bg-blue-50">Log in</button>
          <button onClick={onGoToRegister} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign up</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Your Virtual Assistant hub for tasks, time, and billing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            VA Pro helps you manage clients, track hours, and stay organized with a focused dashboard, quick links, and smart reports.
          </p>
          <div className="mt-6 flex space-x-3">
            <button onClick={onGetStarted} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</button>
            <button onClick={onGoToRegister} className="px-6 py-3 bg-white dark:bg-gray-900 border rounded-lg text-blue-600 hover:bg-blue-50">Create an account</button>
          </div>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 dark:text-gray-200">
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Time tracking with daily limits</li>
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Client and project management</li>
            <li className="p-3 bg-white dark:bg-gray-900 border rounded">Dashboard with clock and quick links</li>
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

      <footer className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Clark Lindley Suan. All rights reserved.</p>
        <p>Contact: <a className="text-blue-600" href="mailto:clarklindleysuan@gmail.com">clarklindleysuan@gmail.com</a> · <a className="text-blue-600" href="https://clark-lindley-suan.vercel.app" target="_blank" rel="noreferrer">clark-lindley-suan.vercel.app</a></p>
      </footer>
    </div>
  );
}


