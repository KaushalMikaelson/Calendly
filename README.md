# Calendly Clone — Full Stack Scheduling App

## Live Demo
[deployed URL here]

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 18 |
| Icons | Lucide React |
| Date handling | date-fns |
| HTTP | Axios |
| Email | Nodemailer |

## Features
### Core Features
- ✅ Event Types Management (Create, Edit, Delete)
- ✅ Unique public booking link per event type
- ✅ Availability Settings (weekly hours + timezone)
- ✅ Public Booking Page with interactive calendar
- ✅ Available time slot generation
- ✅ Double booking prevention (DB-level OVERLAPS check)
- ✅ Booking confirmation page
- ✅ Meetings page (Upcoming / Past / Cancel)

### Bonus Features
- ✅ Buffer time before/after meetings
- ✅ Date-specific availability overrides
- ✅ Rescheduling flow
- ✅ Email notifications (Nodemailer)
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Landing page
- ✅ Add to Google Calendar / iCal

## Database Schema
7 tables with proper relationships:
- `users` — default admin user
- `event_types` — name, slug, duration, color, buffer times
- `availability_schedules` — named schedules with timezone
- `availability_rules` — per-day rules (day_of_week, start, end)
- `date_overrides` — specific date exceptions
- `bookings` — confirmed/cancelled meetings with cancel tokens
- `booking_answers` — custom question responses

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 18

### Installation
```bash
# Clone
git clone <your-repo-url>
cd calendly-clone

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env: set DB_PASSWORD to your PostgreSQL password

# Run migrations & seed
npm run migrate
npm run seed

# Start backend (port 5000)
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Environment Variables (backend/.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendly
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:5173
```

## Public Booking Links
- 30 min meeting: http://localhost:5173/book/30min
- 60 min meeting: http://localhost:5173/book/60min
- 15 min chat: http://localhost:5173/book/15min

## Assumptions
- Single admin user (no authentication required per spec)
- All times stored in UTC, displayed in Asia/Kolkata timezone
- Availability is shared across all event types
- Email notifications are optional (skip if SMTP not configured)

