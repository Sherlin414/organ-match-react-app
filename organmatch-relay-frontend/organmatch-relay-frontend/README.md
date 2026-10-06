# OrganMatch Relay System — Frontend

A React frontend for the OrganMatch Relay System project: an AI priority-queue
organ matching platform with automated green-corridor logistics as the
fulfillment layer.

## Getting Started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`). The `/`
route is now a public landing page — log in or register from there.

To build a production bundle:

```bash
npm run build
npm run preview   # serve the built files locally
```

## Demo Accounts

Every seed account uses the password `password123`:

| Role | Email |
|---|---|
| Patient | patient@organmatch.dev |
| Doctor | doctor@organmatch.dev |
| Hospital Admin | admin@organmatch.dev |
| Donor Coordinator | donor@organmatch.dev |
| System Admin | sysadmin@organmatch.dev |
| Ambulance | ambulance@organmatch.dev |
| Police | police@organmatch.dev |

You can also register a brand new account for any role from the **Register**
page (role selection → role-specific form).

## What's Implemented

- **Public landing page** (`/`) — hero, live network stats, an organ icon
  showcase, a "How It Works" walkthrough, and role cards, all visible before
  logging in. Logged-in users are redirected straight to their dashboard.
- **Separate login/register per actor role** (7 roles): Patient, Doctor,
  Hospital Admin, Donor Coordinator, System Admin, Ambulance, Police.
- **Role-based route protection** — `ProtectedRoute` redirects a logged-in
  user to their own dashboard if they try to reach another role's page.
- **Field-level edit permissions** — see `src/utils/permissions.js`. A patient
  can edit their name, contact number, and password, but clinical fields are
  read-only with an explanation.
- **Settings page** — theme (light/dark), font size, font style, accent
  color, and language (English, Tamil, Hindi, Spanish), all persisted and
  applied live via CSS custom properties.
- **Original SVG organ icons** (`src/assets/organIcons.jsx`) — small, colorful
  icons for Kidney, Heart, Liver, Lung, and Pancreas, used in the waitlist
  table, patient dashboard, donor registration form, and match alert card.
- **7 role-specific dashboards** reflecting the actual project flow.

## Architecture: How This Maps to MVC

React apps aren't naturally MVC, but this project is organized so the
mapping is real, not just a label:

| MVC Role | Where | What it does |
|---|---|---|
| **Model** | `src/store/` (Redux), `src/contexts/` (Context), `src/api/` | Owns state and business rules. `themeSlice.js` is the Redux model for theme/font/color. `AuthContext.jsx` is the model for the logged-in user, backed by `src/api/authApi.js`. |
| **View** | `src/pages/`, `src/components/` | Renders UI only. Pages call controller functions on submit; they don't decide what happens next themselves. |
| **Controller** | `src/controllers/authController.js` | Sits between View and Model: `handleLoginSubmit`, `handleRegisterSubmit`, `handleProfileSave` take the Model's actions (already bound via `useAuth()`) plus what the View needs to react (`setError`, `navigate`), and decide what happens next. |

## State Management: Redux + Context (intentionally hybrid)

- **Redux Toolkit** (`src/store/`) manages **theme settings** — a real
  `createSlice`/`configureStore` setup with `useSelector`/`useDispatch`
  (via the `useTheme()` hook), persisted through `store.subscribe`.
- **React Context** manages **auth** (`AuthContext`) and **language**
  (`LanguageContext`) — simpler global state that doesn't need Redux's
  action/reducer machinery.

This mirrors a common real-world pattern: not everything has to go through
Redux, but it's genuinely there and doing real work for the state that
benefits from it.

## Async / Promises / API Layer

`src/api/authApi.js` is a mock API client — every function (`loginRequest`,
`registerRequest`, `updateProfileRequest`) **returns a Promise**, simulates a
network delay, and throws real `Error` objects on failure. `AuthContext.jsx`
calls these with `async`/`await` inside `try/catch/finally`, and exposes an
`isLoading` flag that the Login, Register, and Profile pages use to disable
their submit buttons and show a "Logging in…" / "Saving…" state.

To connect a real backend later: replace the bodies of the three functions in
`authApi.js` with `fetch(...)` calls. Nothing in `AuthContext.jsx` or any page
needs to change, since they only depend on the Promise-based contract.

## Class Component

`src/components/common/ErrorBoundary.jsx` — this is a genuine, idiomatic use
of a class component in modern React. Error boundaries
(`componentDidCatch` / `getDerivedStateFromError`) have **no hook
equivalent**, so this is one of the few places React still requires a class
rather than a function component. It wraps the entire app in `main.jsx`.

## React Patterns Used

| Hook / Pattern | Where | Why |
|---|---|---|
| `useState` | Everywhere | Local component state |
| `useEffect` | `useCountdown`, `useOutsideClick`, `useTheme` | Timers, DOM listeners, applying CSS variables |
| `useRef` | `useCountdown` (interval ID), `useOutsideClick` (DOM node), `Login.jsx` (auto-focus) | Persisting a mutable value across renders without re-rendering |
| `useCallback` | Every handler passed to a `memo`-wrapped child, all context/controller functions | Stops unnecessary re-renders |
| `useMemo` | `useTheme` (derived lookups), `DoctorDashboard` (sorted waitlist), `RegisterForm` (merged fields) | Avoids recomputing derived data every render |
| `memo` | `Button`, `Card`, `StatusChip`, `StatCard`, `CountdownBadge`, `NotificationItem` | Presentational components that shouldn't re-render unless their own props change |
| `useSelector` / `useDispatch` | `useTheme` | Redux state access |
| `async` / `await` / `Promise` | `authApi.js`, `AuthContext.jsx`, `authController.js` | Realistic async data flow |
| Class component | `ErrorBoundary.jsx` | The one place React still needs a class |
| Custom hooks | `useAuth`, `useTheme`, `useLanguage`, `useLocalStorage`, `useCountdown`, `useOutsideClick` | Encapsulate reusable logic |
| Context API | `AuthContext`, `LanguageContext` | Global state without prop-drilling |
| Redux Toolkit | `themeSlice`, `store` | Global state with actions/reducers |

## Project Structure

```
src/
├── api/               # authApi.js — mock async API layer (Promises)
├── assets/            # organIcons.jsx — original SVG icons
├── controllers/        # authController.js — MVC controller layer
├── store/              # Redux: store.js, themeSlice.js
├── contexts/           # AuthContext, LanguageContext
├── hooks/               # useAuth, useTheme (Redux-backed), useLanguage, useCountdown, useOutsideClick, useLocalStorage
├── i18n/                # translations.js (en, ta, hi, es)
├── utils/               # roleConfig.js, permissions.js
├── data/                # mockData.js, seedUsers.js
├── components/
│   ├── common/          # Button, Card, StatusChip, StatCard, CountdownBadge, Dropdown,
│   │                     # NotificationItem, ProtectedRoute, ErrorBoundary (class), ThemeEffectsBridge
│   └── layout/           # Navbar, DashboardLayout
└── pages/
    ├── Home.jsx           # public landing page
    ├── auth/               # Login, RegisterRoleSelect, RegisterForm
    ├── patient/ doctor/ hospitalAdmin/ donorCoordinator/ ambulance/ police/ systemAdmin/
    ├── settings/
    └── profile/
```

## Notes

- This is a **frontend-only** build. `src/api/authApi.js` simulates a backend
  using `localStorage` — there's no real server. Passwords are stored in
  plain text for demo purposes only; do not use real passwords or deploy
  this as-is.
- Fonts are loaded from Google Fonts in `index.html` — an internet
  connection is needed for the non-default font style options to render
  correctly (the app still works offline, it just falls back to the
  system font).
- Organ icons are original inline SVGs, not external image files, so there's
  nothing extra to load or that can go missing.
