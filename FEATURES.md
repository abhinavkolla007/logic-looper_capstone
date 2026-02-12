# Features

## Gameplay
- Deterministic daily puzzle generation
- Multiple puzzle styles with progressive difficulty
- Scoring with hint penalties and time bonuses
- Timed challenge mode support

## Progress & Retention
- Streak tracking
- 365-day heatmap visualization
- Achievement unlocking

## Auth Modes
- Google sign-in via Firebase
- Truecaller-style dev sign-in flow (4-digit OTP in development)
- Guest mode

## Offline & PWA
- Service worker for offline capability
- IndexedDB storage for local progress and queued sync
- Manifest-enabled installable PWA shell

## Backend APIs
- Health endpoint (`/health`)
- Daily score upsert and batch sync
- Daily leaderboard endpoint
- User stats + streak update endpoints
