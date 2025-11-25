# WhatsUp Frontend (minimal scaffold)

This is a minimal Vue 3 (Vite) scaffold for Sections 6 (Auth + Setup).

Quick start:

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

Environment:
- Copy `.env.example` to `.env` and adjust `VITE_API_URL` to your backend (default `http://localhost:3000`).

What is included:
- Pages: Login, Register, ForgotPassword, ChooseUsername, UploadAvatar
- Pinia store `auth` for token storage (localStorage/sessionStorage)
- `api` wrapper (axios) that injects Bearer token
- Sentry initialization helper (read `.env` variable `VITE_SENTRY_DSN`)
- Simple logger wrapper

Notes:
- This is a minimal scaffold to speed up frontend dev. Improve UI, validation, and security for production.
