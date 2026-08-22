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
- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/sahildevaliya3-cloud/GlobeTrotter.git
cd GlobeTrotter
```

Install backend and frontend dependencies:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

---

### 2. Backend Setup & Embedded Database

Navigate to the `backend` directory:
```bash
cd backend
```

Copy the environment example file:
```bash
cp .env.example .env
```

Start the embedded PostgreSQL database (runs automatically on `localhost:5432`):
```bash
npm run postgres:start
```

Synchronize database schema and seed initial data:
```bash
# Push schema to database
npx prisma db push

# Seed cities and activities dataset
npm run seed
```

Start backend development server:
```bash
npm run dev
```
Backend API will run at `http://localhost:3001`.

---

### 3. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
```

Copy the frontend environment template:
```bash
cp .env.example .env
```

Start Vite dev server:
```bash
npm run dev
```
Frontend web application will open at `http://localhost:5173`.

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
