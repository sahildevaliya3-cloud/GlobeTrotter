/**
 * auth.js — OAuth routes (Google) + one-time-code (OTC) exchange
 *
 * Flow:
 *   Browser → GET /auth/google
 *     → Passport redirects to Google consent
 *   Google → GET /auth/google/callback
 *     → find-or-create user → issue OTC → redirect to FRONTEND_URL/auth/callback?code=<otc>
 *   Frontend POSTs → POST /auth/exchange { code }
 *     → returns { token, user }  (OTC burned after use, expires in 60s)
 */

import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "globetrotter-dev-secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/auth/google/callback";

// ── One-time code store (in-memory, 60-second TTL) ───────────────────────────
// In production with multiple instances, replace with Redis.
/** @type {Map<string, { token: string; user: object; expiresAt: number }>} */
const otcStore = new Map();

function issueOTC(token, user) {
  const code = uuidv4();
  otcStore.set(code, { token, user, expiresAt: Date.now() + 60_000 });
  return code;
}

function consumeOTC(code) {
  const entry = otcStore.get(code);
  if (!entry) return null;
  otcStore.delete(code);
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}

// Prune expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otcStore) {
    if (now > v.expiresAt) otcStore.delete(k);
  }
}, 60_000);

// ── Token + user helpers (duplicated from index.js for isolation) ─────────────
function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl ?? null,
    photo_url: user.photoUrl ?? null,
    language: user.language ?? "en",
    isAdmin: user.isAdmin ?? false,
    is_admin: user.isAdmin ?? false,
    createdAt: user.createdAt,
  };
}

// ── find-or-create OAuth user ─────────────────────────────────────────────────
async function findOrCreateOAuthUser(prisma, { provider, oauthId, email, name, photoUrl }) {
  // 1. Look up by (provider, oauthId) — returning user
  const byOAuth = await prisma.user.findFirst({
    where: { oauthProvider: provider, oauthId },
  });
  if (byOAuth) return byOAuth;

  // 2. Look up by email — link OAuth to existing email/password account
  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { oauthProvider: provider, oauthId, photoUrl: photoUrl || byEmail.photoUrl },
      });
    }
  }

  // 3. Create brand-new OAuth user (no password)
  return prisma.user.create({
    data: {
      name: name || "Traveler",
      email: email?.toLowerCase() || `${provider}_${oauthId}@oauth.local`,
      oauthProvider: provider,
      oauthId,
      photoUrl: photoUrl || null,
    },
  });
}

// ── Router factory ─────────────────────────────────────────────────────────────
export function createAuthRouter(prisma) {
  const router = Router();

  // ── Configure Google strategy ───────────────────────────────────────────────
  const googleEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

  if (googleEnabled) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
          const email = profile.emails?.[0]?.value;
          const photoUrl = profile.photos?.[0]?.value;
          done(null, {
            oauthId: profile.id,
            email,
            name: profile.displayName,
            photoUrl,
          });
        }
      )
    );
  }

  // Minimal Passport serialisation (not used for sessions — just satisfies Passport internals)
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // ── POST /auth/exchange ─────────────────────────────────────────────────────
  // Public — frontend exchanges one-time code for JWT
  router.post("/exchange", (req, res) => {
    const { code } = req.body ?? {};
    if (!code) return res.status(400).json({ error: "Code is required." });

    const entry = consumeOTC(String(code));
    if (!entry) {
      return res.status(400).json({ error: "Invalid or expired code. Please try signing in again." });
    }

    return res.json({ token: entry.token, user: entry.user });
  });

  // ── GET /auth/google ────────────────────────────────────────────────────────
  router.get("/google", (req, res, next) => {
    if (!googleEnabled) {
      return res.status(503).json({ error: "Google sign-in is not configured on this server." });
    }
    passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
  });

  // ── GET /auth/google/callback ───────────────────────────────────────────────
  router.get(
    "/google/callback",
    (req, res, next) => {
      passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` })(
        req, res, next
      );
    },
    async (req, res) => {
      try {
        const profile = req.user;
        const dbUser = await findOrCreateOAuthUser(prisma, {
          provider: "google",
          oauthId: profile.oauthId,
          email: profile.email,
          name: profile.name,
          photoUrl: profile.photoUrl,
        });

        const token = signToken(dbUser);
        const code = issueOTC(token, publicUser(dbUser));
        return res.redirect(`${FRONTEND_URL}/auth/callback?code=${code}`);
      } catch (err) {
        console.error("[OAuth] Google callback error:", err);
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      }
    }
  );

  // ── GET /auth/status — check which providers are enabled ───────────────────
  router.get("/status", (_req, res) => {
    res.json({
      google: googleEnabled,
    });
  });

  return router;
}
