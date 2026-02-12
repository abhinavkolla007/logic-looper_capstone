# Logic Looper Capstone

Start date: **10 Feb 2026**  
Status: **ACTIVE**  
Priority: **HIGH**

This repository contains:

- `frontend/`: React + Tailwind client-first puzzle app
- `backend/`: Express + Prisma + Neon PostgreSQL API

## Phase coverage

### Phase 1 (Foundation)
- Project setup + boilerplate ✅
- Authentication flow (Google/Firebase + Truecaller dev flow + guest) ✅
- PostgreSQL schema with Prisma for Neon ✅
- Vercel deployment guidance/config ✅
- IndexedDB client storage ✅

### Phase 2 (Core Game Engine)
- Deterministic puzzle generator (date-seeded) ✅
- 5 puzzle types ✅
- Local solution validator + scoring ✅
- Core game UI ✅
- Local persistence ✅

### Phase 3 (Engagement)
- Streak system + 365-day heatmap ✅
- Daily progression model ✅
- Hint system ✅
- Basic animations + responsive UI ✅

### Phase 4 (Polish)
- Baseline optimization (batch sync, caching, minimal API usage) ✅
- Test + lint baseline ✅

## Local development

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
cd frontend
npm run lint
npm test
npm run build
```
