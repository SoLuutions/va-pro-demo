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
- **Express.js** - API server
- **Redis** - Data storage and caching
- **Node.js** - Runtime environment

## Data Storage

### Current Implementation (Frontend)
- **localStorage** - All user data is stored client-side in the browser
  - Client records
  - Task management
  - Time entries
  - User profiles
  - Timer state persistence

### Backend API (Optional Integration)
- **Express.js** server provides REST endpoints for future Redis integration
- Generic key-value storage endpoints available but not currently utilized by frontend
- Endpoints: `/api/data/:userId/:key` (GET/POST/DELETE)

### Available for Future Enhancement
Both `REDIS_URL` and `DATABASE_URL` environment variables are configured and ready for backend integration:
- **Redis** - Fast caching, session management, real-time data sync
- **PostgreSQL** - Relational data models, user authentication, advanced queries

## Quick Start

### Prerequisites
- Node.js 20 or higher
- Redis database access
- PostgreSQL database access

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file or set the following secrets in Replit:
   ```
   REDIS_URL=your_redis_connection_url
   DATABASE_URL=your_postgresql_connection_url
   ```

3. Start the development server:
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
- **Current**: All data stored in browser localStorage (client-side only)
- **Backend**: Express server with Redis endpoints available but not actively used
- **Future**: Redis and PostgreSQL connections ready for server-side data migration

### Timezone Handling
- Default timezone: Asia/Manila (Philippine Time)
- Configurable per-user in profile settings
- Time window enforcement: 8 AM - 8 PM by default

## Deployment

This application can be deployed on Railway or similar platforms:

1. Push code to GitHub
2. Connect repository to Railway
3. Configure environment variables in Railway dashboard:
   - `REDIS_URL` - Your Redis connection URL
   - `DATABASE_URL` - (Optional) PostgreSQL connection URL for future use
4. Railway will automatically build and deploy

**Current State**: 
- The frontend is fully functional and stores all data in browser localStorage
- The Express backend provides Redis API endpoints but they are not currently integrated with the frontend
- Only `REDIS_URL` is actively used by the backend; `DATABASE_URL` is configured but unused
- For production deployment with server-side persistence, frontend components would need to be updated to call the backend API instead of using localStorage

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
