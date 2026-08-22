# 🌍 GlobeTrotter — Full-Stack Travel Itinerary & Budget Planner

GlobeTrotter is a modern, full-stack web application designed for seamless trip planning, itinerary creation, day-wise activity scheduling, budget tracking, calendar management, and public trip sharing.

---

## 🔗 Live Application Links

- **Frontend Web App**: `https://globetrotter-app.vercel.app` *(Replace with your deployed Vercel/Netlify URL)*
- **Backend API**: `https://globetrotter-api.onrender.com` *(Replace with your deployed Render/Railway URL)*
- **API Health Check**: `https://globetrotter-api.onrender.com/health`

---

## ✨ Features

- **🔐 User Authentication**: Secure JWT-based signup, login, session management, and password hashing (`bcryptjs`).
- **🗺 Trip Builder**: Create and edit trips with custom names, date ranges, descriptions, cover photos, and target budgets.
- **📍 Multi-City Stop Planning**: Add, reorder, and schedule cities as ordered stops along a trip itinerary.
- **🎉 Activity Discovery & Scheduling**: Browse and filter curated activities by category (*Sightseeing*, *Food*, *Adventure*, *Culture*, *Relaxation*) or cost limit. Schedule activities to specific dates and times with custom cost overrides.
- **📖 Read-Only Itinerary View**: View trip plans grouped by stop and date, featuring stop headers, order badges, duration trackers, and activity details.
- **📅 Interactive Day-Grid Calendar**: Color-coded day-by-day calendar timeline with city color legends, day detail expansion, and quick-edit popover modal for rescheduling dates, times, and costs.
- **📊 Trip Budget & Cost Breakdown**: Hero stat cards for total estimated cost and daily average, over-budget alert status, and interactive **Recharts** category expense distribution pie chart.
- **🌐 Public Trip Sharing & Cloning**: Toggle public link sharing to generate unique share slugs (`/share/:shareSlug`). Allow guest/public viewers to view read-only itineraries and clone entire trips to their own account with one click.
- **⚙ Profile & Settings**: Editable display name, avatar photo URL with live image preview, read-only primary email badge, language preference selection, and strong account deletion confirmation dialog.
- **📱 Responsive Mobile First Design**: Fully responsive layout optimized for 375px mobile portrait, 768px tablet, and 1280px desktop screens with touch-friendly controls (`min-h-[44px]`) and mobile navigation menu.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS + Tailwind CSS utilities
- **Routing**: React Router v7 (`react-router-dom`)
- **Data Visualization**: Recharts (`PieChart`, `ResponsiveContainer`, `Tooltip`)

### Backend
- **Runtime**: Node.js + Express.js
- **Database & ORM**: PostgreSQL + Prisma ORM (v6)
- **Embedded Database (Dev)**: `embedded-postgres` (zero local installation required)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)

---

## 🚀 Quick Start — Local Development Setup

### Prerequisites
- Node.js v18+
- npm

### 1. Clone & Install All Dependencies
```bash
git clone https://github.com/sahildevaliya3-cloud/GlobeTrotter.git
cd GlobeTrotter

# Install root dev tools (concurrently)
npm install

# Install backend packages
cd backend && npm install && cd ..

# Install frontend packages
cd frontend && npm install && cd ..
```

### 2. One-Time Database Setup (first run only)
```bash
cd backend

# Copy env template
copy .env.example .env    # Windows
# cp .env.example .env   # macOS/Linux

# Start postgres once to initialise, then Ctrl+C after it says "PostgreSQL is running"
npm run postgres:start

# Push schema and seed data
npx prisma db push
npm run seed

cd ..
```

---

### 3. Start Full Dev Environment

#### ✅ Option A — One command from the project root (recommended)
```bash
# From GlobeTrotter/ root:
npm run dev
```
This starts **both** the backend (port **3001**) and frontend (port **5173**) together with colour-coded output.

#### Option B — Two separate terminals
```bash
# Terminal 1 — API server + embedded database
cd backend
npm run dev
# → PostgreSQL starts on localhost:5432
# → API listening on http://localhost:3001

# Terminal 2 — React frontend
cd frontend
npm run dev
# → Vite dev server on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

> **Environment variable**: `frontend/.env` must contain `VITE_API_URL=http://localhost:3001` (already set by default — no changes needed for local development).

---

## 🧪 Testing

Run backend integration test suites:
```bash
cd backend

# Test user authentication
npm run test:auth

# Test trip builder API
npm run test:trips

# Test budget aggregation API
npm run test:budget

# Test trip-activities quick-edit API
npm run test:trip-activities

# Test public sharing & trip cloning
npm run test:share

# Test user profile & account deletion API
npm run test:users
```

Verify frontend production build:
```bash
cd frontend
npm run build
```

---

## 📦 Production Deployment

For detailed hosting instructions on **Vercel / Netlify**, **Render / Railway**, and **Supabase / Neon**, refer to the full [Deployment Guide (DEPLOYMENT.md)](file:///c:/Users/Admin/OneDrive/Documents/GitHub/GlobeTrotter/DEPLOYMENT.md).

---

## 📜 API Route Reference

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server health check | No |
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Log in and receive JWT token | No |
| `GET` | `/users/me` | Fetch authenticated profile | Yes |
| `PUT` | `/users/me` | Update name, photo, language | Yes |
| `DELETE` | `/users/me` | Delete account and user data | Yes |
| `GET` | `/trips` | List user trips | Yes |
| `POST` | `/trips` | Create a new trip | Yes |
| `GET` | `/trips/:id` | Fetch trip details & stops | Yes |
| `PUT` | `/trips/:id` | Edit trip details / target budget | Yes |
| `PUT` | `/trips/:id/share` | Toggle public link & share slug | Yes |
| `POST` | `/trips/clone/:slug` | Clone public trip to account | Yes |
| `GET` | `/trips/:id/budget` | Aggregate budget & breakdown | Yes |
| `PUT` | `/trip-activities/:id`| Quick-edit activity date/time/cost | Yes |
| `GET` | `/public/:shareSlug`| View shared public trip itinerary | No |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
