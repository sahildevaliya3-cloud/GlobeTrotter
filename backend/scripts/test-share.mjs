import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const API_URL = process.env.API_URL || "http://localhost:3001";
const prisma = new PrismaClient();

function logStep(title) {
  console.log(`\n=== ${title} ===`);
}

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

async function signup(email, name) {
  const result = await request("/auth/signup", {
    method: "POST",
    body: {
      name,
      email,
      password: "secret123",
    },
  });

  if (result.status !== 201) {
    throw new Error(`Signup failed for ${email}: ${JSON.stringify(result.data)}`);
  }

  return result.data.token;
}

async function main() {
  logStep("1. Setup users & create trip");
  const ownerEmail = `share-owner-${Date.now()}@example.com`;
  const viewerEmail = `share-viewer-${Date.now()}@example.com`;
  const ownerToken = await signup(ownerEmail, "Share Owner");
  const viewerToken = await signup(viewerEmail, "Share Viewer");

  const tripRes = await request("/trips", {
    method: "POST",
    token: ownerToken,
    body: {
      name: "Bali Island Hopping",
      description: "Tropical beaches and temples",
      start_date: "2026-12-01",
      end_date: "2026-12-10",
    },
  });

  const tripId = tripRes.data.trip.id;

  logStep("2. PUT /trips/:id/share — Toggle is_public to true & generate slug");
  const shareRes = await request(`/trips/${tripId}/share`, {
    method: "PUT",
    token: ownerToken,
    body: { is_public: true },
  });

  console.log("Share status:", shareRes.status);
  console.log("Share data:", JSON.stringify(shareRes.data, null, 2));

  if (shareRes.status !== 200 || !shareRes.data.shareSlug) {
    throw new Error("Failed to enable trip sharing");
  }

  const shareSlug = shareRes.data.shareSlug;

  logStep("3. GET /public/:shareSlug — Unauthenticated public access");
  const publicRes = await request(`/public/${shareSlug}`);
  console.log("Public GET status:", publicRes.status);
  console.log("Public trip ownerName:", publicRes.data?.trip?.ownerName);

  if (publicRes.status !== 200 || publicRes.data.trip.ownerName !== "Share Owner") {
    throw new Error("Public endpoint failed or ownerName mismatch");
  }

  logStep("4. POST /trips/clone/:shareSlug — Clone trip to another account");
  const cloneRes = await request(`/trips/clone/${shareSlug}`, {
    method: "POST",
    token: viewerToken,
  });

  console.log("Clone status:", cloneRes.status);
  console.log("Cloned trip name:", cloneRes.data?.trip?.name);

  if (cloneRes.status !== 201 || !cloneRes.data.trip.name.startsWith("Copy of Bali Island Hopping")) {
    throw new Error("Trip cloning failed");
  }

  logStep("5. PUT /trips/:id/share — Make trip private again");
  const unshareRes = await request(`/trips/${tripId}/share`, {
    method: "PUT",
    token: ownerToken,
    body: { is_public: false },
  });

  console.log("Unshare status:", unshareRes.status);

  const publicResPrivate = await request(`/public/${shareSlug}`);
  console.log("Public GET after unshare status (expect 404):", publicResPrivate.status);

  if (publicResPrivate.status !== 404) {
    throw new Error("Expected 404 for private trip via public endpoint");
  }

  console.log("\n✅ All sharing and cloning backend tests passed!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
