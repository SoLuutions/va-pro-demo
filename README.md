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
- Exportable reports in PDF format
- Visual charts and graphs

### 6. Billing & Invoicing
- Generate professional invoices
- Calculate billable hours automatically
- Track paid vs. unpaid invoices
- Client billing history
- Customizable invoice templates

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
- **Express.js** - API server
- **In-memory storage** - Ephemeral server-side storage (no external DB)
- **Node.js** - Runtime environment

## Storage Architecture

### In-memory (Current Implementation)
- Per-user key-value storage in server memory
- Real-time timer state and simple data
- Fast operations
- Ephemeral: data resets on server restarts

### Future Database Option
This demo can be extended to use Redis or PostgreSQL later. That would require adding a proper data layer and environment variables.

## Quick Start

### Prerequisites
- Node.js 20 or higher

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment variables (optional):
   Create a `.env` file if needed for `PORT`. No DB vars are required.

3. Start the development server:
   ```bash
   npm start
   ```
   This runs both the Express backend (port 3000) and Vite frontend (port 5000) simultaneously.

### Alternative Commands

- **Dev (backend + frontend)**: `npm run dev`
- **Production build**: `npm run build`
- **Start server**: `npm start`

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

- `GET /api/health` - Server health check
- `GET /api/data/:userId/:key` - Retrieve user data from Redis
- `POST /api/data/:userId/:key` - Store user data in Redis
- `DELETE /api/data/:userId/:key` - Delete user data from Redis

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://default:password@host:port` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:password@host:port/database` |

### Security Notes

- All database credentials are stored as environment variables
- Never commit credentials to version control
- Use Replit Secrets for secure credential management
- API endpoints include error handling and validation

## Development

### Hot Module Replacement (HMR)
The Vite dev server supports HMR for instant updates during development.

### Data Persistence
- Frontend uses `localStorage` for client-side state
- Backend uses in-memory storage (ephemeral)

### Timezone Handling
- Default timezone: Asia/Manila (Philippine Time)
- Configurable per-user in profile settings
- Time window enforcement: 8 AM - 8 PM by default

## Deployment

This application can be deployed on Railway:

1. Push code to GitHub
2. Connect repository to Railway
3. Set `PORT` (Railway usually injects it automatically)
4. No database add-ons are required
5. Railway will automatically build and deploy

Note: Since storage is in-memory, data will reset on each deploy/restart. For persistent storage, integrate a database.

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
