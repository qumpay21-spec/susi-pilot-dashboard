# Susi Air · Pilot Portal

A pilot dashboard built for the Susi Air Full Stack Developer technical test.
It shows a pilot's **duty roster**, **document validity** and **flight time against regulatory limits**, using the mock data supplied with the brief.

| Layer    | Stack                                  |
| -------- | -------------------------------------- |
| Frontend | Nuxt 4, Vue 3, Pinia, TypeScript       |
| Backend  | NestJS 12, TypeScript, REST API        |
| Data     | `mock-schedules.json`, `mock-documents.json`, `mock-flight-hours.json` |

- **Live app:** _add URL_
- **API:** _add URL_/api/health

---

## Features

**Duty roster calendar**
- Month view (Mon–Sun) with navigation limited to the months that have data.
- Each day is filled with its duty colour; DTY days show the base code (MKW, PDG…), other duties show the duty code (TRX, MED…).
- The badge shows the number of flights scheduled; it turns into a **tick** when `count_logbooks === count_schedules`.
- Click a day for details: duty, base/location, status, logbook progress, missing entries.
- Month stats (duty days, flights planned, flights logged) and a legend of the duty types in use.

**Documents & licences**
- Days remaining = `expiryDate − today`.
- `≤ 0` → **Expired** (red), `1–30` → **Expiring soon** (amber), otherwise **Valid** (green).
- Sorted by urgency, with a summary count and alerts in the page header.

**Flight time vs limits**
- Tabs for 1W / 1M / 3M / 6M / 1Y, each using its `chartBounds` entry (limit, axis max, window).
- Each bar is the **rolling total for the window ending on that day** (e.g. 1M = hours in the last 30 days), shown for the last 7 days (`displayRangeDays`). This is how flight-time limits are checked.
- Bars turn amber at ≥ 90% of the limit and red above it; dashed line marks the limit. Hover a bar for that day's hours.
- Summary tiles show current usage of every window.

**General**
- Susi Air brand colours (navy / red) and logo.
- Responsive from phone to desktop, keyboard accessible, loading skeletons and per-card error states with retry.

## Data notes

The mock data has a few inconsistencies. The API handles them explicitly instead of hiding them:

| Issue | Handling |
| --- | --- |
| `today` differs per file (`2026-05-15` in schedules, `2026-05-31` in documents) and flight hours have none | Each card uses its own dataset's date and shows it ("Roster date", "As of"). Flight hours use the last date in the data. `GET /api/documents?today=` can override. |
| 2026-06-04 is `TRX` but has colour `#FBA577` (the TRD colour) | The **legend is the source of truth** for colours; the mismatch is listed under "Data check" in the day details. |
| Non-DTY days have `base_name` like `CJN`/`HLP`, but the field guide says it should match the duty code | The calendar shows the duty code as the guide says; the raw value is kept as the location. |
| 2026-05-15 is `status: 1` (pending) with 6/6 logged | Tick is driven only by the logbook counts, as specified; status is shown separately. |

## API

Base path: `/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/pilot` | Pilot name, total hours, limits, available ranges |
| GET | `/schedules?month=YYYY-MM` | Legend + normalised schedule days (month optional) |
| GET | `/schedules/:date` | One day (`YYYY-MM-DD`) |
| GET | `/documents?today=YYYY-MM-DD` | Documents with `daysRemaining` and `status` |
| GET | `/flight-hours?range=1w\|1m\|3m\|6m\|1y&endDate=YYYY-MM-DD` | Rolling-total series for the chart |
| GET | `/flight-hours/summary?endDate=YYYY-MM-DD` | Current total for every window |

Invalid input returns `400` with a clear message (e.g. `range must be one of: 1w, 1m, 3m, 6m, 1y`).

## Project structure

```
backend/
  data/                 mock JSON files
  src/
    common/date.util.ts UTC date helpers (no time-zone drift)
    data/               loads the JSON once (swap for a DB repository later)
    schedules/          roster normalisation
    documents/          expiry status rules
    flight-hours/       rolling-window totals + pilot profile
frontend/
  app/
    stores/dashboard.ts Pinia store: data, per-card loading/error, selections
    components/         DutyCalendar, DayDetail, DocumentList, FlightHoursChart, LimitTiles, UpcomingDuties
    pages/index.vue     dashboard layout
```

Business rules live in the backend services; the frontend only renders.

## Run locally

Requirements: Node.js 22+.

```bash
# 1. API → http://localhost:3001/api
cd backend
npm install
npm run start:dev

# 2. Web → http://localhost:3000
cd frontend
npm install
npm run dev
```

The frontend reads the API URL from `NUXT_PUBLIC_API_BASE` (default `http://localhost:3001/api`).

## Deploy

**API (Render, Railway, Cloud Run…)**
- Root: `backend`, build `npm ci && npm run build`, start `npm run start:prod`.
- Env: `CORS_ORIGIN=https://<your-frontend-domain>`; `PORT` is set by the platform.
- `render.yaml` is included for Render.

**Frontend (Vercel, Netlify…)**
- Root: `frontend`, build `npm run generate`, output `.output/public`.
- Env: `NUXT_PUBLIC_API_BASE=https://<your-api-domain>/api`.

## Logo

Place the official logo at `frontend/public/logo-susiair.png` (from susiair.com). Until it is there, the app shows a vector wordmark in the brand colours.
