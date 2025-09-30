# VA Pro Demo

## Overview
A clickable demo for a Philippine VA-focused productivity SaaS built with React, Vite, and Tailwind CSS. The application provides a comprehensive dashboard for managing virtual assistant tasks, clients, time tracking, reports, and billing.

## Project Architecture
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development Server**: Runs on port 5000

## Project Structure
```
├── src/
│   ├── components/
│   │   ├── tabs/          # Tab components (Dashboard, Clients, Tasks, etc.)
│   │   ├── ClientModal.jsx # Client add/edit modal component
│   │   ├── TaskModal.jsx   # Task add/edit modal component
│   │   └── VADemo.jsx     # Main demo component with state management
│   ├── App.jsx            # Root application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies and scripts
```

## Features
- **Dashboard**: Overview of hours, active tasks, clients, and earnings
- **Clients**: Client management with details, rates, and project tracking
  - Add/edit clients with full form validation
  - Click any client to edit details
- **Tasks**: Task management with priorities, status, and time tracking
  - Add/edit tasks with client assignment
  - Click any task to edit details
  - Start/stop timer for active tasks
- **Time Tracking**: Timer functionality and time entry management
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

## Recent Changes
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
