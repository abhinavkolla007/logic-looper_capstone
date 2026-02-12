# Deployment Guide (Vercel + Neon + Firebase)

## 1) Prerequisites

- Firebase project with Google auth enabled
- Neon PostgreSQL database
- GitHub repository connected to Vercel

## 2) Backend deployment (Vercel)

- Framework preset: **Other**
- Root directory: `backend`
- Install command: `npm install`
- Build command: *(empty)*

Set backend environment variables:

- `DATABASE_URL`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://<your-frontend-domain>.vercel.app`

## 3) Frontend deployment (Vercel)

- Framework preset: **Vite**
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set frontend environment variables:

- `VITE_API_BASE_URL=https://<your-backend-domain>.vercel.app`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 4) Post-deploy verification

- Open frontend URL and confirm app loads
- Check backend health endpoint: `/health`
- Verify Google login and guest login
- Solve puzzle and confirm leaderboard API response
- Confirm no CORS errors in browser console
