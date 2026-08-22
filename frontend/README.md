# GlobeTrotter

A full-stack travel itinerary planning app — React + Vite frontend, Node/Express/Prisma backend.

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use the embedded Postgres via `npm run postgres:start` in `/backend`)

### Start the backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3001
```

### Start the frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

---

## Environment Variables

Copy and fill in the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## OAuth Sign-In Setup

The app supports **"Continue with Google"** on the Login/Signup screens.

### Google OAuth

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Under **Authorised redirect URIs**, add:
   - Development: `http://localhost:3001/auth/google/callback`
   - Production: `https://api.yourdomain.com/auth/google/callback`
5. Copy the **Client ID** and **Client Secret** into `backend/.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

> **Important:** The redirect URI in Google Cloud Console must match `GOOGLE_CALLBACK_URL` **exactly** (including `http://` vs `https://` and trailing slash).

---

## Architecture Notes

### One-Time Code (OTC) OAuth Pattern

After the provider callback, the backend:
1. Find-or-creates a user row in the DB
2. Issues a short-lived **one-time code** (UUID, 60s TTL, stored in-memory)
3. Redirects the browser to `FRONTEND_URL/auth/callback?code=<otc>`

The frontend (`/auth/callback`) exchanges the code via `POST /auth/exchange` → receives a JWT. The JWT never appears in server logs or browser history.

### Account Linking

If a Google email matches an existing email/password account, the OAuth identity is **linked to that existing account** — no duplicate user row is created.

### OAuth-only accounts

If a user signed up via Google, they have no password. Attempting to sign in with their email and a password returns:
> *"This account uses Google sign-in. Please use the 'Google' button on the login screen."*

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel / Netlify |
| Backend API | Render / Railway |
| Database | Supabase / Neon |

After deploying, update:
- `GOOGLE_CALLBACK_URL` → your production backend URL
- `FRONTEND_URL` → your production frontend URL
- Add the production callback URLs to Google Cloud Console
