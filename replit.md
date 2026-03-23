# WELLDHAN — Wellness + Organic Food Platform

A full-stack platform for gated communities managing wellness sessions, organic food delivery, and household payments.

## Architecture

- **Frontend**: React + Vite + TypeScript + Material UI v5 (dark green theme)
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **State**: Zustand (auth/UI) + TanStack React Query (server state)
- **Auth**: JWT + 2FA OTP via SMS

## Project Structure

```
frontend-web/     React + Vite frontend (port 5000)
backend/          Express API backend (port 8000)
```

## Frontend Key Files

- `src/main.tsx` — Entry point with QueryClientProvider + ThemeProvider + RouterProvider
- `src/router.tsx` — Role-based protected routes
- `src/theme.tsx` — Dark green MUI theme (#2d7a47 primary, #4ade80 accent)
- `src/store/authStore.ts` — Zustand auth store with localStorage persistence
- `src/api/client.ts` — Axios with JWT interceptors + proxy to `/api/v1`
- `src/hooks/` — React Query hooks for all data fetching

## Backend Key Files

- `backend/app/main.js` — Entry point, connects to MongoDB
- `backend/app/app.js` — Express app with all routes registered
- `backend/app/core/config.js` — Settings from env vars (MONGO_URL, JWT_SECRET)
- `backend/app/routes/` — All route handlers

## Workflows

- **Start application**: `cd frontend-web && npm run dev` → port 5000 (webview)
- **Backend API**: `cd backend && npm run dev` → port 8000 (console)

## Frontend Pages by Role

### User
- `/dashboard` — Dashboard with stats, upcoming session, family members
- `/book` — Book training sessions with sport filter
- `/bookings` — View upcoming/past/cancelled bookings
- `/food` — Food basket preferences with toggle
- `/payments` — Payment status + UPI/WhatsApp integration
- `/members` — Family member management
- `/profile` — Profile edit + package info

### Trainer
- `/trainer/home` — Today's sessions + booking count
- `/trainer/attendance` — Mark present/absent per student
- `/trainer/students` — Student list with search
- `/trainer/profile` — Trainer profile view

### Manager/Admin
- `/manager/dashboard` — Stats overview + recent bookings + low stock
- `/manager/residents` — Household list with search
- `/manager/payments` — Payment table + WhatsApp reminders
- `/manager/inventory` — Food stock management with inline edit
- `/manager/slots` — Slot creation and management

## API Proxy

Vite proxies `/api` to `http://localhost:8000` in development. The frontend uses `/api/v1` as the base URL.

## Environment Variables

- `MONGO_URL` — MongoDB connection string (required, in Replit secrets)
- `JWT_SECRET` — JWT signing key (in shared env vars)
- `NODE_ENV` — development / production

## Authentication Flow

1. POST `/api/v1/auth/login` → returns `{ requires_2fa, challenge_id }` or `{ token }`
2. If 2FA required: POST `/api/v1/2fa/sms/verify-otp` → returns `{ token, role, user_id, user_data }`
3. Token stored in Zustand store (persisted to localStorage)
4. All API calls include `Authorization: Bearer {token}` header
