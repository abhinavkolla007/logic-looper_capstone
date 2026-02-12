# Environment Setup

## Backend (`backend/.env`)

Copy `backend/.env.example` to `.env` and update values:

```bash
cp backend/.env.example backend/.env
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string (Neon or local Postgres)
- `PORT`: Backend API port (default `5000`)
- `NODE_ENV`: `development` or `production`
- `CORS_ORIGIN`: Comma-separated allowed origins (e.g. `http://localhost:5173,https://your-site.vercel.app`)

## Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `.env.local` and fill Firebase credentials:

```bash
cp frontend/.env.example frontend/.env.local
```

Required variables:

- `VITE_API_BASE_URL`: backend base URL
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_VAPID_PUBLIC_KEY`: for future push notifications
