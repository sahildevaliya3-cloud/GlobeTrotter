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
  logStep("1. Setup users & create trip with stop");
  const ownerEmail = `ta-owner-${Date.now()}@example.com`;
  const otherEmail = `ta-other-${Date.now()}@example.com`;
  const ownerToken = await signup(ownerEmail, "TA Owner");
  const otherToken = await signup(otherEmail, "TA Other");

  const tripRes = await request("/trips", {
    method: "POST",
    token: ownerToken,
    body: {
      name: "Kyoto Autumn",
      start_date: "2026-11-01",
      end_date: "2026-11-07",
    },
  });

  const tripId = tripRes.data.trip.id;

  const city = await prisma.city.create({
    data: {
      name: "Kyoto",
      country: "Japan",
      costIndex: 1.3,
      popularityScore: 92,
    },
  });

  const activity = await prisma.activity.create({
    data: {
      cityId: city.id,
      name: "Fushimi Inari Shrine",
      category: "culture",
      cost: 0,
      durationHours: 2,
    },
  });

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId: city.id,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-07"),
      orderIndex: 0,
    },
  });

  const tripActivity = await prisma.tripActivity.create({
    data: {
      stopId: stop.id,
      activityId: activity.id,
      scheduledDate: new Date("2026-11-01"),
      scheduledTime: new Date("1970-01-01T09:00:00.000Z"),
    },
  });

  logStep("2. PUT /trip-activities/:id — Update scheduled date, time, custom_cost");
  const updateRes = await request(`/trip-activities/${tripActivity.id}`, {
    method: "PUT",
    token: ownerToken,
    body: {
      scheduled_date: "2026-11-03",
      scheduled_time: "14:30",
      custom_cost: 25.5,
    },
  });

  console.log("Update status:", updateRes.status);
  console.log("Updated data:", JSON.stringify(updateRes.data, null, 2));

  if (updateRes.status !== 200) {
    throw new Error("PUT /trip-activities/:id failed");
  }

  const updatedTA = updateRes.data.tripActivity;
  if (!updatedTA.scheduledDate.startsWith("2026-11-03")) {
    throw new Error(`Expected date 2026-11-03, got ${updatedTA.scheduledDate}`);
  }
  if (updatedTA.customCost !== "25.5" && updatedTA.customCost !== 25.5) {
    throw new Error(`Expected customCost 25.5, got ${updatedTA.customCost}`);
  }

  logStep("3. Authorization check — PUT as another user (expect 403)");
  const forbiddenRes = await request(`/trip-activities/${tripActivity.id}`, {
    method: "PUT",
    token: otherToken,
    body: { scheduled_date: "2026-11-04" },
  });
  console.log("Forbidden status:", forbiddenRes.status);
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected status 403, got ${forbiddenRes.status}`);
  }

  logStep("4. DELETE /trip-activities/:id");
  const deleteRes = await request(`/trip-activities/${tripActivity.id}`, {
    method: "DELETE",
    token: ownerToken,
  });
  console.log("Delete status:", deleteRes.status);
  if (deleteRes.status !== 204) {
    throw new Error(`Expected status 204, got ${deleteRes.status}`);
  }

  console.log("\n✅ All trip-activities API tests passed!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
