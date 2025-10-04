# VA Pro Demo

## Overview
A clickable demo for a Philippine VA-focused productivity SaaS built with React, Vite, and Tailwind CSS. The application provides a comprehensive dashboard for managing virtual assistant tasks, clients, time tracking, reports, and billing.

## Project Architecture
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Timezone Handling**: Luxon (GMT+8 / Asia/Manila default)
- **State Persistence**: localStorage
- **Development Server**: Runs on port 5000

## Project Structure
```
├── src/
│   ├── components/
│   │   ├── tabs/          # Tab components (Dashboard, Clients, Tasks, etc.)
│   │   ├── ClientModal.jsx # Client add/edit modal with time limits
│   │   ├── TaskModal.jsx   # Task add/edit modal with estimates
│   │   ├── FocusMode.jsx   # Full-screen focus mode timer
│   │   ├── ProfileModal.jsx # User profile editor
│   │   ├── Toast.jsx       # In-app toast notifications
│   │   └── VADemo.jsx      # Main demo component with state management
│   ├── utils/
│   │   ├── timeWindow.js   # Time slot and limit enforcement
│   │   ├── notifications.js # Browser notifications manager
│   │   └── localStorage.js  # State persistence utilities
│   ├── App.jsx             # Root application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles with animations
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies and scripts
```

## Features
- **Dashboard**: Overview of hours, active tasks, clients, and earnings
  - **Quick Links Panel**: Fast access to frequently used tools
    - Add/edit/delete quick links (Zoom, Slack, Google Drive, etc.)
    - Customizable links with name, URL, and color
    - Stored in localStorage for persistence
  - **Timezone Quick Converter**: Real-time timezone display
    - Shows current time for all client timezones
    - Automatically updates every second
    - Displays client names with their local times
  - **Calendar Sync**: Placeholder UI for future Google Calendar/Outlook integration
- **User Profile**: Editable profile with timezone settings
  - Click profile in header to edit
  - Set name, email, timezone, avatar
  - Reset to blank slate option
- **Clients**: Client management with details, rates, and project tracking
  - Add/edit clients with full form validation
  - Daily time limits per client (e.g., 4 hours/day)
  - Working time slots with timezone conversion to GMT+8
  - Enforce time slots (block timer outside hours)
  - Click any client to edit details
- **Tasks**: Task management with priorities, status, and countdown timers
  - Add/edit tasks with client assignment
  - Estimated time for tasks (countdown timer)
  - Allow/disallow overrun past estimated time
  - **Google Drive Quick Link**: One-click access to Google Drive when adding file links
  - Click any task to edit details
  - Start/pause/stop timer with enforcement of client limits
  - Timer persists across page reloads
  - Filter tasks by client, status, and search text
- **Advanced Timer Features**:
  - **Countdown Mode**: Timer counts down from estimated time
  - **Overrun Tracking**: Shows overtime when exceeding estimates
  - **Focus Mode**: Full-screen timer view with:
    - Large countdown display
    - Current date and time
    - Task and client details
    - **Pomodoro Timer**: Toggle 25/5 work/break cycles
      - 25-minute work sessions
      - 5-minute break sessions
      - Auto-phase switching with visual indicators
      - Purple display for work, green for breaks
    - Break button (pause without logging)
    - Stop timer button
    - Exit focus mode (timer continues)
    - ESC key to exit
  - **Client Time Enforcement**:
    - Blocks timer if outside client's working hours
    - Blocks timer if daily limit reached
    - Notifications for time slot starts
  - **Notifications**:
    - Browser notifications (with permission)
    - In-app toast messages
    - Alerts for time limits, task completion, slot starts
- **Time Tracking**: Kanban-style board view for visual task management
  - 4-column board (To Do, In Progress, Review, Completed)
  - Filter tasks by client
  - Start/stop timer directly from kanban cards
  - Click cards to edit task details
  - Active timer banner shows current running task with countdown
  - Enter focus mode button in active timer banner
- **Reports**: Analytics and performance reports
- **Billing**: Invoice generation and billing management
  - PDF invoice generation with jsPDF
  - Automatic calculation of hours, subtotal, and taxes

## Development
The development server is configured to run on port 5000 with host 0.0.0.0 to work with Replit's proxy environment. HMR (Hot Module Replacement) is configured for the Replit environment.

## Deployment
Configured for autoscale deployment:
- Build command: `npm run build`
- Run command: `npx vite preview --host 0.0.0.0 --port 5000`

## Technical Details
- **Timezone Management**: All times converted to Asia/Manila (GMT+8) for display while storing client-specific timezone data
- **Timer Architecture**: Timestamp-based timer system eliminates drift and enables recovery on page reload
- **State Persistence**: All data (clients, tasks, time entries, user profile, active timer) saved to localStorage
- **Notifications**: Dual notification system with browser notifications (permission-gated) and in-app toasts
- **Break Tracking**: Break time is tracked separately and excluded from billable time

## Recent Changes
- 2025-10-04: Productivity features enhancement
  - **Quick Links Panel**: Added customizable quick links dashboard widget
    - Fast access to Zoom, Slack, Google Drive, and other tools
    - Add/edit/delete functionality with color customization
    - Persistent storage with localStorage
  - **Timezone Quick Converter**: Added real-time timezone widget
    - Displays current time for all client timezones
    - Auto-updates every second
    - Shows client names with their local times in GMT+8
  - **Google Drive Quick Link**: Added quick access button in Task Modal
    - One-click access to Google Drive when adding file links
    - Opens in new tab for easy file management
  - **Pomodoro Timer in Focus Mode**: Added Pomodoro technique support
    - Toggle-able 25-minute work / 5-minute break cycles
    - Auto-phase switching with visual indicators
    - Purple timer display for work sessions
    - Green timer display for break sessions
    - Independent progress bar for Pomodoro cycles
  - **Calendar Sync UI**: Added placeholder UI for future Google Calendar/Outlook integration

- 2025-10-04: Fresh start configuration for production use
  - **Removed all demo data**: Users now start with a completely blank slate
  - **Custom scrollbar design**: Added sleek, minimal scrollbar styling throughout the app and modals
  - **Reports reorganization**: Daily Shift Report moved to top as the most important section
  - **EOD Report copy feature**: Replaced Print button with "Copy EOD Report" button
    - Copies formatted EOD report to clipboard in user's specified format:
      - User's name + EOD Report header
      - Date and total hours worked
      - Client-organized task list with time spent, descriptions, and file links
  - **Enhanced time slot UI**: Added complete time slot input interface in Client Modal
    - Add/remove multiple time slots per client
    - Set start and end times for each slot
    - Select timezone (defaults to Philippine Time/GMT+8)
    - Visual time slot management with remove functionality

- 2025-10-03: GitHub import setup for Replit environment
  - Fixed npm module installation issues (rollup native module)
  - Updated .gitignore with comprehensive Node.js entries
  - Configured autoscale deployment for production
  - Verified frontend running on port 5000 with proper host configuration

- 2025-10-01: Comprehensive timer system overhaul
  - **Countdown Timers**: Tasks now have estimated time and count down instead of up
  - **Client Time Management**:
    - Added daily time limits per client (in minutes)
    - Added working time slots with timezone support
    - Time slot enforcement to block timers outside working hours
    - All times converted to GMT+8 (Asia/Manila) for VA schedule
  - **Focus Mode**: Full-screen distraction-free timer view
    - Large countdown display with overrun tracking
    - Break functionality (pause without stopping)
    - Current time and date display
    - Task and client information
    - Exit without stopping timer
  - **Notifications & Reminders**:
    - Browser notifications for time limits and task completion
    - In-app toast notifications for all timer events
    - Permission management for browser notifications
  - **User Profile System**:
    - Editable profile accessible from header
    - Timezone selection for user
    - Blank slate reset option
  - **Enhanced Data Persistence**:
    - All state saved to localStorage
    - Active timer recovery on page reload
    - Timestamp-based timer prevents drift
    - Break time tracking separate from work time
  - **Updated Modals**:
    - ClientModal: Added daily limits, time slots, timezone selection
    - TaskModal: Added estimated time, allow overrun checkbox
  - **Utilities**:
    - timeWindow.js: Time slot validation, daily limit tracking, timezone conversion
    - notifications.js: Browser and in-app notification management
    - localStorage.js: State persistence utilities

- 2025-09-30: Enhanced filtering and kanban board view
  - Added client, status, and search filtering to Tasks page
  - Redesigned Time Tracking page to kanban-style board view with 4 columns
  - Added client filtering to Time Tracking kanban board
  - Integrated timer controls directly into kanban cards
  - Added active timer banner for better visibility

- 2025-09-30: Added interactive features
  - Implemented client add/edit modal with full form validation
  - Implemented task add/edit modal with client selection
  - Added PDF invoice generation using jsPDF library
  - Integrated modals into main app flow
  - Connected edit functionality to client and task items
  
- 2025-09-30: Initial Replit setup
  - Configured Vite for Replit proxy environment (0.0.0.0:5000, allowedHosts: true)
  - Fixed node_modules binary permissions
  - Set up development workflow
  - Configured deployment for production
