# VA Pro Demo

A comprehensive productivity and time-tracking SaaS application designed specifically for Philippine Virtual Assistants (VAs). This platform helps VAs manage clients, track billable hours, handle tasks, and generate professional reports and invoices.

## Project Overview

VA Pro is a full-featured productivity platform that enables virtual assistants to:
- Manage multiple clients and their information
- Create and track tasks with time estimates
- Monitor billable hours with an integrated timer
- Generate detailed reports and invoices
- Work in focus mode for distraction-free productivity
- Maintain user profiles with timezone support

## Key Features & Capabilities

### 1. Client Management
- Add, edit, and manage client information
- Store client contact details and hourly rates
- Track active projects per client
- View client-specific task lists and billing history

### 2. Task Management
- Create tasks with descriptions and time estimates
- Assign tasks to specific clients
- Set task priorities and deadlines
- Track task status (To Do, In Progress, Completed)
- Time window restrictions to prevent tracking outside designated hours

### 3. Time Tracking
- Start/stop timers for individual tasks
- Automatic time entry creation
- Break time tracking (excluded from billable hours)
- Real-time timer display in all views
- Persistent timer state (survives page refreshes)
- Time window validation (8 AM - 8 PM Manila time by default)

### 4. Dashboard
- Overview of active timers and current tasks
- Quick stats: total clients, active tasks, hours tracked
- Recent activity feed
- Quick access to frequently used actions
- Customizable quick links

### 5. Reports & Analytics
- Time-based reports (daily, weekly, monthly)
- Client-specific time breakdowns
- Task completion analytics
- PDF export capability (requires jsPDF library)
- Basic data visualization

### 6. Billing & Invoicing
- Calculate billable hours based on tracked time
- Client hourly rate configuration
- Invoice data management
- Basic billing history tracking

### 7. Focus Mode
- Distraction-free fullscreen workspace
- Timer and task details always visible
- Minimalist interface for deep work
- Quick task switching

### 8. User Profile Management
- Customizable user profiles
- Timezone settings
- Authentication system with login/register
- Profile avatar support

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Luxon** - Timezone and date handling
- **jsPDF** - PDF report generation

### Backend
- **Express.js** - Lightweight API server
- **Node.js** - Runtime environment

## Data Storage

### Current Implementation
- **localStorage** - All data stored client-side in browser
  - Client records
  - Task management
  - Time entries
  - User profiles
  - Timer state persistence
  - Works offline
  - No database required

### Backend API
- Simple Express server running on port 3000
- Provides health check endpoint
- No database connections (localStorage-only mode)
- API endpoints return informational responses only

### Future Enhancement Options
If you need server-side storage in the future, you can integrate:
- **Redis** - For fast caching and session management
- **PostgreSQL** - For relational data and user authentication

## Quick Start

### Prerequisites
- Node.js 20 or higher
- No database required (uses browser localStorage)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   This runs both the Express backend (port 3000) and Vite frontend (port 5000) simultaneously.

### Alternative Commands

- **Frontend only**: `npm run dev`
- **Backend only**: `npm run server`
- **Production build**: `npm run build`
- **Preview production**: `npm run preview`

## Project Structure

```
va-pro-demo/
├── src/
│   ├── components/
│   │   ├── auth/           # Login and registration
│   │   ├── tabs/           # Main application tabs
│   │   ├── ClientModal.jsx
│   │   ├── TaskModal.jsx
│   │   ├── ProfileModal.jsx
│   │   ├── FocusMode.jsx
│   │   └── VADemo.jsx      # Main app component
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state
│   ├── utils/
│   │   ├── localStorage.js # Client-side storage
│   │   ├── notifications.js # Notification system
│   │   └── timeWindow.js   # Time validation
│   ├── App.jsx
│   └── main.jsx
├── server/
│   └── index.js            # Express API server
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Endpoints

The Express backend provides the following API endpoints:

- `GET /api/health` - Server health check and storage mode status
- `GET /api/data/:userId/:key` - Returns localStorage-only message (no server storage)
- `POST /api/data/:userId/:key` - Returns localStorage-only message (data saved to browser only)
- `DELETE /api/data/:userId/:key` - Returns localStorage-only message (no server data to delete)

**Note**: These endpoints are placeholders for future backend integration. Currently, all data is stored in browser localStorage.

## Development

### Hot Module Replacement (HMR)
The Vite dev server supports HMR for instant updates during development.

### Data Persistence
- All data stored in browser localStorage (client-side)
- Works completely offline after initial load
- No server-side database required
- Data persists across browser sessions

### Timezone Handling
- Default timezone: Asia/Manila (Philippine Time)
- Configurable per-user in profile settings
- Time window enforcement: 8 AM - 8 PM by default

## Deployment

This application can be deployed on Vercel, Netlify, Railway, or similar platforms:

1. Push code to your chosen platform
2. Set build command: `npm run build`
3. Set start/preview command: `npm start`
4. Deploy - no environment variables or databases required

**Note**: The app uses localStorage for all data storage, so it works without any backend database configuration. The Express server runs alongside Vite but doesn't require any database connections.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

This is a demo application. For production use, consider:
- Implementing proper authentication with JWT tokens
- Adding database migrations
- Setting up comprehensive error logging
- Implementing rate limiting
- Adding automated tests

## License

Proprietary - Demo Application
