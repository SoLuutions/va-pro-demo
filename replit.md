# VA Pro Demo

## Overview
VA Pro Demo is a clickable prototype for a productivity SaaS tailored for Philippine Virtual Assistants. It offers a comprehensive dashboard for managing tasks, clients, time tracking, reports, and billing, aiming to streamline VA operations and enhance productivity. The application is built with React, Vite, and Tailwind CSS, providing a responsive and intuitive user experience.

## User Preferences
The agent should prioritize iterative development and provide detailed explanations for any significant changes or architectural decisions. Before implementing major changes, the agent should ask for confirmation. The user prefers clear and concise communication.

## System Architecture
The application is a client-side focused demo built with **React 18** and **Vite 5**. Styling is handled using **Tailwind CSS**, and icons are provided by **Lucide React**. Timezone management defaults to **GMT+8 (Asia/Manila)**, utilizing **Luxon**. All application state and data are persisted client-side using **localStorage**, eliminating the need for a backend database in this demo. The development server runs on port 5000.

**UI/UX Decisions:**
- The design emphasizes a clean, intuitive dashboard interface.
- Customizable quick links panel allows users to personalize their workspace.
- A "Focus Mode" provides a distraction-free full-screen timer view.
- Kanban-style board for visual task management.
- Custom scrollbar design for a sleek look.

**Technical Implementations:**
- **Time Management**: Timestamp-based timer system for accuracy and recovery on page reload, including countdown timers, overrun tracking, and Pomodoro cycles.
- **Client & Task Management**: Modals for adding/editing clients and tasks with validation, daily time limits per client, and working time slots with timezone enforcement.
- **Notifications**: A dual system of browser notifications and in-app toasts for critical events like time limits and task completion.
- **State Persistence**: All user data (clients, tasks, time entries, user profile, active timer) is saved and retrieved from `localStorage`.
- **Reporting**: Placeholder for analytics, with a feature to copy a formatted End-of-Day (EOD) report to the clipboard.
- **Billing**: PDF invoice generation using `jsPDF`, with automatic calculation of hours, subtotal, and taxes.

**Feature Specifications:**
- **Dashboard**: Displays hours, active tasks, clients, earnings, quick links, and a timezone quick converter.
- **User Profile**: Editable profile with timezone settings.
- **Clients**: Management of client details, rates, daily time limits, and working time slots.
- **Tasks**: Creation and management of tasks with priorities, estimated time, client assignment, and Google Drive quick link integration.
- **Advanced Timer**: Features countdown, overrun tracking, a full-screen Focus Mode with Pomodoro timer (25/5 work/break cycles), and client time enforcement.
- **Time Tracking**: Kanban board for task visualization with timer controls integrated into cards.
- **Reports & Billing**: Sections for analytics and invoice generation.

## External Dependencies
- **React**: Frontend UI library.
- **Vite**: Build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Luxon**: JavaScript library for date and time.
- **jsPDF**: JavaScript library for generating PDFs (used for invoice generation).