# 🚀 GlobeTrotter Deployment Guide

This guide provides step-by-step instructions for deploying the **GlobeTrotter** full-stack travel planner to production.

---

## Architecture Overview

- **Frontend**: React 18 + Vite SPA (Deploy on **Vercel** or **Netlify**)
- **Backend API**: Node.js + Express + Prisma ORM (Deploy on **Render**, **Railway**, or **Fly.io**)
- **Database**: Managed PostgreSQL (Provision on **Supabase**, **Neon**, or **Render Postgres**)

---

## Step 1: Provision PostgreSQL Database (Supabase / Neon)

### Option A: Supabase
1. Sign up/log in at [supabase.com](https://supabase.com).
2. Click **New Project**, choose a project name (e.g., `globetrotter-db`), database password, and region.
3. Once created, navigate to **Project Settings** → **Database**.
4. Copy the **Transaction / Direct Connection String**:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres?sslmode=require
   ```

### Option B: Neon
1. Sign up/log in at [neon.tech](https://neon.tech).
2. Create a project named `globetrotter`.
3. Copy the pooled PostgreSQL connection string from the dashboard dashboard:
   ```text
   postgresql://user:password@ep-example-123456.us-east-1.aws.neon.tech/globetrotter?sslmode=require
   ```

---

## Step 2: Deploy Backend API (Render / Railway)

### Option A: Render
1. Sign up/log in at [render.com](https://render.com) and connect your GitHub repository.
2. Click **New +** → **Web Service**.
3. Select the `GlobeTrotter` repository.
4. Configure service settings:
   - **Name**: `globetrotter-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `DATABASE_URL` | Your PostgreSQL connection string from Step 1 |
   | `JWT_SECRET` | A secure random 32+ character key |
   | `CLIENT_ORIGIN` | `https://globetrotter.vercel.app` (your frontend deployment URL) |
   | `PORT` | `3001` (Render automatically assigns port) |
6. Click **Create Web Service**.
7. Once deployed, run database migrations by executing the build command or running remotely:
   ```bash
   npx prisma migrate deploy
   ```
8. Copy your live backend URL (e.g., `https://globetrotter-api.onrender.com`).

---

## Step 3: Deploy Frontend SPA (Vercel / Netlify)

### Option A: Vercel (Recommended)
1. Sign up/log in at [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project** and import your GitHub repository.
3. Configure deployment settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | Your live backend URL (e.g., `https://globetrotter-api.onrender.com`) |
5. Click **Deploy**.
6. SPA routing rewrite rules are automatically loaded from [vercel.json](file:///c:/Users/Admin/OneDrive/Documents/GitHub/GlobeTrotter/frontend/vercel.json).

### Option B: Netlify
1. Sign up/log in at [netlify.com](https://netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
4. Add Environment Variable `VITE_API_URL` pointing to your backend service.
5. SPA redirect rule is automatically handled by [frontend/public/_redirects](file:///c:/Users/Admin/OneDrive/Documents/GitHub/GlobeTrotter/frontend/public/_redirects).

---

## Step 4: Post-Deployment Verification

1. Test API Health: `GET https://your-backend.onrender.com/health` (should return `{"ok": true}`).
2. Open live frontend app URL:
   - Test User Signup / Login.
   - Create a trip, add stops, and schedule activities.
   - Test Read-Only Itinerary View & Calendar Day Grid.
   - Test Public Trip Sharing toggle & Share URL.
   - Test Profile Settings & Language selection.
