# Sahayak — welfare schemes & civic grievance platform (frontend)

Vite + React + Tailwind frontend for the hackathon problem statement (IEMH4-SI-01).
Fully demoable right now with in-memory mock data — no backend required to show it live.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## What's included

- `/` — landing page
- `/schemes` — eligibility form → matched welfare schemes with steps + docs needed
- `/report` — anonymous civic issue reporting with geolocation capture + evidence upload
- `/track` — public status lookup by tracking ID (no login)
- `/admin` — password-gated dashboard: reports table, status updates, region chart
  - Demo password: `municipal2026`

Language switcher in the navbar supports English / Hindi / Bengali (`src/i18n/strings.js` — add more languages by adding a key there).

## Swapping mock data for your real backend

All data access goes through `src/api/client.js`. Right now `USE_MOCK = true` routes every
call to in-memory mock data in `src/data/`. Once your Express API is up:

1. Set `USE_MOCK = false` in `src/api/client.js`
2. Point `vite.config.js`'s proxy (`/api` → `http://localhost:5000`) at your backend port
3. No component code needs to change — every page already calls the abstracted functions
   (`fetchSchemes`, `checkEligibility`, `submitReport`, `fetchReports`, `setReportStatus`, etc.)

## Suggested next backend endpoints

```
GET    /api/schemes
POST   /api/schemes/match        { income, location, occupation, category }
GET    /api/reports
GET    /api/reports/:id
POST   /api/reports              { description, category, lat, lng, mediaUrl }
PATCH  /api/reports/:id/status   { status }
```

## Design notes

- Palette: navy/ink primary, a single warm gold accent reserved for calls-to-action and
  in-progress status — meant to read as a trustworthy public-service tool, not a marketing page.
- The `StatusTrack` component (used on `/track`) is the one signature visual element: a
  connected progress line through Reported → In review → Escalated → Resolved, because that
  sequence is the one genuinely ordered thing in this product.
- Mobile-first: bottom nav appears under 640px, all forms and tables scroll/stack cleanly.

## Not built yet (by design, for hackathon time budget)

- Real backend / persistence — see mock swap notes above
- Real auth for admin — currently a single shared demo password
- Full multilingual chatbot / voice — the language toggle + guided form covers the "low
  literacy" requirement without a conversational AI layer, which would eat too much of a
  36-hour budget. Worth adding after judging if you continue the project.
