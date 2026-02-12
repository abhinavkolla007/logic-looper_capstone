# Logic Looper Frontend

Client-first daily puzzle game built with React + Tailwind + Redux Toolkit.

## Implemented scope

- React 18+ + Tailwind boilerplate
- Google auth (Firebase popup) + Truecaller dev flow + guest mode
- 5 rotating puzzle types with deterministic date seed
- IndexedDB persistence (daily progress, streak data, sync queue)
- Batched backend sync every 5 solved puzzles
- Streak heatmap + hint/score loop
- Framer Motion transitions
- Jest + React Testing Library setup

## Environment

Create `.env` in `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

## Run

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Performance/client optimization behavior

- Cached daily progress in IndexedDB
- Queue + batch sync (5-puzzle cadence)
- Deterministic local generation (no puzzle API calls)
- Heatmap uses local progress map for instant render

## Deployment notes (Vercel)

- Frontend can be deployed as a Vite static project.
- Set environment variables in Vercel project settings.
- Point `VITE_API_BASE_URL` to deployed backend URL.
