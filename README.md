# VA Pro

A full-featured productivity and time-tracking SaaS application built for Philippine Virtual Assistants (VAs). Track time, manage clients, generate invoices, and stay in focus — all from one premium-quality web app.

---

## Features

### Landing Page
- Public marketing page shown to first-time visitors
- Highlights features, stats, and CTAs before requiring sign-up

### Authentication
- **Supabase Auth** (email/password) when a Supabase project is configured
- **Local fallback** (localStorage + SHA-256 hashed passwords) when Supabase is not configured — works entirely offline
- Register, Login, and Logout flows with friendly error messages

### Dashboard
- Overview stats: total clients, active tasks, hours tracked today/this week
- Recent activity feed
- Quick-access links (customisable)
- Live active-timer display

### Client Management
- Add, edit, and archive client profiles
- Store: name, email, location, timezone, hourly rate, status
- Per-client task list and billing history
- NDA mode — hides real names across the entire UI

### Task Management
- Create tasks with title, description, priority, deadline, and time estimate
- Assign tasks to clients and track status: `To Do → In Progress → Done`
- Task templates for repeatable work
- Regex-powered global search across tasks and clients (e.g. `/invoice|acme/i`)

### Time Tracking
- Start / stop timer per task (one active timer at a time)
- Break tracking — pauses billable time without stopping the session
- Automatic time-entry creation on stop
- Timer persists across page refreshes via `localStorage`
- Time-window validation (configurable; default 8 AM – 8 PM Manila time)
- Overtime indicator when task exceeds its estimated time

### Focus Mode
- Fullscreen, distraction-free workspace (`Esc` to exit)
- Shows task name, client, live timer, estimated time remaining, and break controls

### Reports
- Daily, weekly, and monthly time breakdowns
- Per-client filtering
- Export to PDF with one click (`jsPDF`)

### Billing & Invoicing
- Auto-calculate billable amounts from time entries × hourly rate
- Generate professional invoices per client
- Track paid / unpaid status

### Command Palette (`Ctrl+K`)
- Search and jump between views
- Create tasks or clients instantly
- Toggle active timer from anywhere

### Themes & Appearance
Six runtime-switchable themes (toggle button in sidebar):

| Theme | Mode |
|-------|------|
| Green | Light |
| Green Dark | Dark |
| Blue | Light |
| Dark | Dark |
| Red | Light |
| Red Dark | Dark |

Animated WebGL shader background (Three.js) adapts per theme.

### Profile & Settings
- Display name, avatar URL, timezone
- NDA mode toggle
- Theme preference persisted in Supabase or `localStorage`

### Sync & Offline
- When Supabase is configured: cloud sync for user data and settings
- When offline or unconfigured: seamless `localStorage` fallback
- Online/offline status indicator in the top bar

---

## Technology Stack

### Frontend
- **React 18** — UI framework
- **Vite 5** — build tool and dev server with HMR
- **Tailwind CSS 3** — utility-first styling
- **Lucide React** — icon library
- **Luxon** — timezone-aware date/time handling
- **jsPDF** — client-side PDF generation
- **Three.js** — animated WebGL shader background

### Backend
- **Express 5** — API server
- **Node.js 20+** — runtime
- **express-rate-limit** — API rate limiting
- **In-memory storage** — ephemeral server-side state (resets on restart)

### Auth & Storage
- **Supabase** (`@supabase/supabase-js`) — optional cloud auth and data sync
- **localStorage** — client-side persistence and offline fallback

---

## Quick Start

### Prerequisites
- Node.js 20 or higher

### Installation

```bash
npm install
```

### Environment Variables (optional)

Create a `.env` file (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

> **Without Supabase**, the app runs entirely in the browser using `localStorage`. No external services required.

### Run in Development

```bash
npm run dev
```

Starts the Express API server (port 3000) and Vite dev server (port 5000) concurrently.

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Backend + frontend (development) |
| `npm run dev:web` | Vite frontend only |
| `npm run dev:server` | Express backend only (with watch) |
| `npm run build` | Production bundle |
| `npm run preview` | Preview production build |
| `npm start` | Production server |

---

## Project Structure

```
va-pro-demo/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthAlert.jsx       # Inline error/info banners
│   │   │   ├── Login.jsx           # Sign-in form
│   │   │   └── Register.jsx        # Registration form
│   │   ├── tabs/
│   │   │   ├── Dashboard.jsx       # Main overview
│   │   │   ├── Clients.jsx         # Client list & detail
│   │   │   ├── Tasks.jsx           # Task list & kanban
│   │   │   ├── TimeTracking.jsx    # Time-entry log
│   │   │   ├── Reports.jsx         # Analytics & PDF export
│   │   │   └── Billing.jsx         # Invoices & billing
│   │   ├── ClientModal.jsx         # Add/edit client
│   │   ├── CommandPalette.jsx      # Ctrl+K command palette
│   │   ├── ErrorBoundary.jsx       # React error boundary
│   │   ├── FocusMode.jsx           # Fullscreen focus overlay
│   │   ├── LandingPage.jsx         # Public marketing page
│   │   ├── ProfileModal.jsx        # User profile & settings
│   │   ├── ShaderBackground.jsx    # Three.js animated background
│   │   ├── TaskModal.jsx           # Add/edit task
│   │   ├── Toast.jsx               # Notification toasts
│   │   └── VADemo.jsx              # Main authenticated app shell
│   ├── context/
│   │   ├── AppDataContext.jsx      # App-wide data & timer state
│   │   └── AuthContext.jsx         # Authentication state
│   ├── lib/
│   │   └── supabase.js             # Supabase client setup
│   ├── utils/
│   │   ├── authErrors.js           # Auth error formatting
│   │   ├── cloudStorage.js         # Supabase data helpers
│   │   ├── localStorage.js         # localStorage helpers & keys
│   │   ├── notifications.js        # Browser notifications
│   │   ├── retry.js                # Fetch with retry
│   │   ├── sanitize.js             # Input validation & sanitisation
│   │   └── timeWindow.js           # Time-window & overtime logic
│   ├── App.jsx                     # Root: landing → auth → app routing
│   ├── index.css                   # Design system & CSS variables
│   └── main.jsx                    # React entry point
├── server/
│   └── index.js                    # Express API server
├── scripts/
│   └── setup-db.mjs                # Database setup helper
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/data/:userId/:key` | Retrieve user data |
| `POST` | `/api/data/:userId/:key` | Store user data |
| `DELETE` | `/api/data/:userId/:key` | Delete user data |
| `POST` | `/api/auth/register` | Server-side registration (Supabase fallback) |

---

## Deployment

### Railway (recommended)

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set environment variables in the Railway dashboard
4. Railway auto-builds and deploys on push

### Vercel

A `vercel.json` is included for static/serverless deployments.

### Notes
- Data stored in-memory on the server resets on restart/redeploy
- For persistent storage, integrate a PostgreSQL add-on and update `server/index.js`
- Static assets are served by Express in production (`dist/`)

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## License

Proprietary — Demo Application  
Portfolio: [clarklindleysuan.com](https://clarklindleysuan.com/)
