# OrganMatch Relay System — Backend

A real Node.js + Express + PostgreSQL backend for the OrganMatch Relay System,
implementing the schema, matching engine, and audit log designed earlier in
this project. This has been tested end-to-end against the actual frontend —
not just written, but verified working.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or reachable)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env if your PostgreSQL user/password/database differ from the defaults

# 3. Create the database (run this in psql or any PostgreSQL client)
createdb organmatch
# or: psql -U postgres -c "CREATE DATABASE organmatch;"

# 4. Create the schema
npm run db:init

# 5. Seed demo data (hospitals, 7 demo users, waitlist patients, a vehicle, a jurisdiction)
npm run db:seed

# 6. Start the server
npm run dev
```

Server runs on `http://localhost:4000` by default. Health check:
`GET http://localhost:4000/api/health` → `{"status":"ok"}`

## Demo Accounts

Password for all: `password123`

| Role | Email |
|---|---|
| Doctor | doctor@organmatch.dev |
| Hospital Admin | admin@organmatch.dev |
| Donor Coordinator | donor@organmatch.dev |
| System Admin | sysadmin@organmatch.dev |
| Ambulance | ambulance@organmatch.dev |
| Police | police@organmatch.dev |
| Patient | patient@organmatch.dev |

## Connecting the Frontend

In the frontend project's `.env`:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

Both projects need to be running at the same time — this backend on port
4000, the frontend dev server on port 5173 (Vite's default). CORS is already
configured to allow `http://localhost:5173` (change `CORS_ORIGIN` in `.env`
if your frontend runs elsewhere).

## What Actually Happens (verified end-to-end)

1. **Donor Coordinator registers an organ** → `POST /api/organs` → the
   matching engine (`src/services/matchingEngine.js`) immediately scans the
   waitlist, scores every waiting patient needing that organ type by blood
   compatibility, and creates a `Match` with the best one. A notification is
   sent to the Hospital Admin at that patient's hospital.
2. **Hospital Admin confirms** → `POST /api/matches/:id/confirm` → the
   routing service (`src/services/routingService.js`) assigns an idle
   vehicle, computes the viability time limit, and cascades a
   `CorridorAlert` notification to every police officer in every
   jurisdiction the route crosses.
3. **Every step is written to a hash-chained audit log**
   (`src/services/auditLogService.js`) — each entry's hash depends on the
   previous entry's hash, so `GET /api/stats/audit-log` includes a
   `chainValid` flag that's computed by actually re-walking and re-hashing
   the whole chain, not hardcoded.
4. **If a match is rejected**, the engine automatically re-matches the same
   organ to the next-best compatible patient.

## API Overview

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | any | Register a new account |
| POST | `/api/auth/login` | any | Log in, get JWT |
| GET | `/api/auth/me` | any | Get own profile |
| PATCH | `/api/auth/me` | any | Update own profile (field-restricted per role) |
| GET | `/api/patients` | Doctor/Admin/SysAdmin | View waitlist |
| POST | `/api/patients` | Doctor | Register a patient |
| GET | `/api/organs` | Donor Coordinator/SysAdmin | List organs |
| POST | `/api/organs` | Donor Coordinator | Register an organ (triggers matching) |
| GET | `/api/matches/pending` | Hospital Admin | View pending matches for own hospital |
| POST | `/api/matches/:id/confirm` | Hospital Admin | Confirm match (triggers routing) |
| POST | `/api/matches/:id/reject` | Hospital Admin | Reject match (triggers re-match) |
| GET | `/api/routes/mine` | Ambulance | View own active route |
| POST | `/api/routes/:id/confirm-delivery` | Ambulance | Mark delivered |
| GET | `/api/jurisdictions/alerts/mine` | Police | View incoming corridor alerts |
| POST | `/api/jurisdictions/alerts/:id/clear` | Police | Clear signals |
| POST | `/api/jurisdictions/alerts/:id/flag-congestion` | Police | Flag congestion |
| GET | `/api/notifications/mine` | any | View own notifications |
| GET | `/api/stats/network` | System Admin | Network-wide KPIs |
| GET | `/api/stats/audit-log` | System Admin | Audit log + chain verification |

Every route except register/login requires `Authorization: Bearer <token>`.
Role checks are enforced server-side in `src/middleware/roles.js` — the
frontend's route protection is a UX convenience, this is the real
enforcement.

## Known Simplifications (honest, not hidden)

- **No real mapping/routing API** — `estimatedTravelTime` is a fixed 20
  minutes rather than coming from Mapbox/Google Maps. Swap this in
  `src/services/routingService.js`.
- **Compatibility scoring is simplified ABO logic** — a real system would
  add tissue typing (HLA matching) and more nuanced Rh-factor rules.
- **Patient identity is denormalized** — a self-registered Patient's
  waitlist fields (`organ_needed`, `blood_type`, `urgency_score`,
  `waitlist_status`) are mirrored onto both `users` and `patients` tables so
  the frontend's `currentUser` object keeps working unchanged. A production
  system should have the frontend fetch this from `patients` via a proper
  join instead.
- **No WebSockets** — dashboards fetch on load/action rather than getting
  pushed live updates. Adding Socket.IO for live ambulance position and
  countdown sync is the natural next step.
- **Single-jurisdiction demo data** — the seed script creates one
  jurisdiction, so the cascading handoff chain has length one. The mechanism
  itself (`route_jurisdictions` junction table + sequential notification)
  works identically regardless of how many jurisdictions a real route
  crosses.

## Project Structure

```
src/
├── server.js              # entry point
├── app.js                 # Express app + route mounting
├── db/
│   ├── schema.sql          # full schema (matches the ER diagram)
│   ├── pool.js             # PostgreSQL connection pool
│   ├── init.js             # runs schema.sql
│   └── seed.js             # demo data
├── middleware/
│   ├── auth.js              # JWT sign/verify
│   └── roles.js             # role-based access control
├── controllers/            # one per resource (auth, patients, organs, matches, routes, jurisdictions, notifications, stats)
├── services/
│   ├── matchingEngine.js    # compatibility scoring + priority ranking
│   ├── routingService.js    # route generation + cascading jurisdiction alerts
│   └── auditLogService.js   # hash-chained audit log
└── routes/                 # Express routers, one per resource
```
