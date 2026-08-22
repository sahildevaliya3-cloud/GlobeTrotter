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

  return { token: result.data.token, user: result.data.user };
}

async function main() {
  logStep("1. Setup user & create test trip");
  const email = `user-profile-${Date.now()}@example.com`;
  const { token, user: initialUser } = await signup(email, "Profile User");

  const tripRes = await request("/trips", {
    method: "POST",
    token,
    body: {
      name: "Tokyo Adventure",
      start_date: "2026-10-01",
      end_date: "2026-10-05",
    },
  });
  const tripId = tripRes.data.trip.id;

  logStep("2. GET /users/me — Fetch profile");
  const getRes = await request("/users/me", { token });
  console.log("GET /users/me status:", getRes.status);
  console.log("Profile data:", JSON.stringify(getRes.data, null, 2));

  if (getRes.status !== 200 || getRes.data.user.name !== "Profile User") {
    throw new Error("GET /users/me failed");
  }

  logStep("3. PUT /users/me — Update profile details (name, photo_url, language)");
  const updateRes = await request("/users/me", {
    method: "PUT",
    token,
    body: {
      name: "Aditi Updated",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      language: "es",
    },
  });

  console.log("PUT /users/me status:", updateRes.status);
  console.log("Updated profile data:", JSON.stringify(updateRes.data, null, 2));

  if (
    updateRes.status !== 200 ||
    updateRes.data.user.name !== "Aditi Updated" ||
    updateRes.data.user.language !== "es"
  ) {
    throw new Error("PUT /users/me failed");
  }

  logStep("4. DELETE /users/me — Delete account with cascading trip deletion");
  const deleteRes = await request("/users/me", {
    method: "DELETE",
    token,
  });

  console.log("DELETE /users/me status:", deleteRes.status);
  if (deleteRes.status !== 204) {
    throw new Error(`Expected 204 status on account deletion, got ${deleteRes.status}`);
  }

  // Verify trip was deleted via cascade
  const tripCheck = await prisma.trip.findUnique({ where: { id: tripId } });
  console.log("Trip check after account deletion (expect null):", tripCheck);
  if (tripCheck !== null) {
    throw new Error("Expected trip to be deleted via cascade");
  }

  console.log("\n✅ All user profile API tests passed!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
