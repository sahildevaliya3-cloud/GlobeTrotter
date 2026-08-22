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

The app supports **"Continue with Google"** and **"Continue with Apple"** buttons on the Login/Signup screens.

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

### Apple Sign In

> [!IMPORTANT]
> **Sign In with Apple requires a paid Apple Developer account ($99/year).**  
> Without credentials, the Apple button is shown but disabled in the UI.

> [!WARNING]
> **Apple requires HTTPS** for callback URLs even in some development environments.  
> For local testing you must use a tunnelling service like [ngrok](https://ngrok.com) to expose your backend over HTTPS.

#### Setup Steps

1. Log in to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**

2. **Create an App ID:**
   - Identifiers → **+** → App IDs → App
   - Enable the **Sign In with Apple** capability
   - Note your **Team ID** (shown top-right in the portal)

3. **Create a Services ID** (this is the OAuth client):
   - Identifiers → **+** → Services IDs
   - Set the identifier (e.g. `com.yourapp.siwa`) → this becomes `APPLE_CLIENT_ID`
   - Click **Configure** next to Sign In with Apple:
     - Primary App ID: select your App ID from step 2
     - Return URLs: add your `APPLE_CALLBACK_URL` (must be HTTPS)

4. **Create a Sign In with Apple Key:**
   - Keys → **+** → check **Sign In with Apple** → Configure (select your App ID)
   - Download the `.p8` private key file — **you can only download it once**
   - Note the **Key ID**

5. Fill in `backend/.env`:

```env
APPLE_CLIENT_ID="com.yourapp.siwa"
APPLE_TEAM_ID="ABCD123456"
APPLE_KEY_ID="XYZKEY1234"
# Paste the contents of the .p8 file, replacing newlines with \n:
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL="https://api.yourdomain.com/auth/apple/callback"
```

6. Set the Apple feature flag in `frontend/.env`:

```env
VITE_APPLE_ENABLED=true
```

---

## Architecture Notes

### One-Time Code (OTC) OAuth Pattern

After the provider callback, the backend:
1. Find-or-creates a user row in the DB
2. Issues a short-lived **one-time code** (UUID, 60s TTL, stored in-memory)
3. Redirects the browser to `FRONTEND_URL/auth/callback?code=<otc>`

The frontend (`/auth/callback`) exchanges the code via `POST /auth/exchange` → receives a JWT. The JWT never appears in server logs or browser history.

### Account Linking

If a Google/Apple email matches an existing email/password account, the OAuth identity is **linked to that existing account** — no duplicate user row is created.

### OAuth-only accounts

If a user signed up via Google/Apple, they have no password. Attempting to sign in with their email and a password returns:
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
- `APPLE_CALLBACK_URL` → your production backend URL (HTTPS required)
- `FRONTEND_URL` → your production frontend URL
- Add the production callback URLs to Google Cloud Console and Apple Developer Portal
