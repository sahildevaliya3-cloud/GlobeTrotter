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

async function seedNestedTripData(tripId) {
  const city = await prisma.city.create({
    data: {
      name: "Paris",
      country: "France",
      costIndex: 1.2,
      popularityScore: 95,
      imageUrl: "https://example.com/paris.jpg",
    },
  });

  const activity = await prisma.activity.create({
    data: {
      cityId: city.id,
      name: "Louvre Museum",
      category: "museum",
      cost: 22.5,
      durationHours: 3,
      description: "World-famous art museum",
      imageUrl: "https://example.com/louvre.jpg",
    },
  });

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId: city.id,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-04"),
      orderIndex: 0,
    },
  });

  await prisma.tripActivity.create({
    data: {
      stopId: stop.id,
      activityId: activity.id,
      scheduledDate: new Date("2026-09-02"),
      scheduledTime: new Date("1970-01-01T10:00:00.000Z"),
      customCost: 20,
    },
  });
}

async function main() {
  const ownerEmail = `trip-owner-${Date.now()}@example.com`;
  const otherEmail = `trip-other-${Date.now()}@example.com`;

  logStep("Setup users");
  const ownerToken = await signup(ownerEmail, "Trip Owner");
  const otherToken = await signup(otherEmail, "Other User");
  console.log("Owner token acquired");
  console.log("Other user token acquired");

  logStep("POST /trips");
  const createResult = await request("/trips", {
    method: "POST",
    token: ownerToken,
    body: {
      name: "European Summer",
      description: "Paris and Rome",
      start_date: "2026-09-01",
      end_date: "2026-09-14",
      cover_photo_url: "https://example.com/cover.jpg",
    },
  });
  console.log("Status:", createResult.status);
  console.log(JSON.stringify(createResult.data, null, 2));

  if (createResult.status !== 201) {
    throw new Error("Create trip failed");
  }

  const tripId = createResult.data.trip.id;
  await seedNestedTripData(tripId);

  logStep("GET /trips");
  const listResult = await request("/trips", { token: ownerToken });
  console.log("Status:", listResult.status);
  console.log(JSON.stringify(listResult.data, null, 2));

  logStep("GET /trips/:id (nested stops + activities)");
  const detailResult = await request(`/trips/${tripId}`, { token: ownerToken });
  console.log("Status:", detailResult.status);
  console.log(JSON.stringify(detailResult.data, null, 2));

  logStep("PUT /trips/:id");
  const updateResult = await request(`/trips/${tripId}`, {
    method: "PUT",
    token: ownerToken,
    body: {
      name: "Updated European Summer",
      description: "Extended itinerary",
    },
  });
  console.log("Status:", updateResult.status);
  console.log(JSON.stringify(updateResult.data, null, 2));

  logStep("GET /trips/:id as another user (expect 403)");
  const forbiddenResult = await request(`/trips/${tripId}`, {
    token: otherToken,
  });
  console.log("Status:", forbiddenResult.status);
  console.log(JSON.stringify(forbiddenResult.data, null, 2));

  logStep("DELETE /trips/:id");
  const deleteResult = await request(`/trips/${tripId}`, {
    method: "DELETE",
    token: ownerToken,
  });
  console.log("Status:", deleteResult.status);
  console.log("Body:", deleteResult.data ?? "(empty)");

  logStep("GET /trips/:id after delete (expect 404)");
  const missingResult = await request(`/trips/${tripId}`, {
    token: ownerToken,
  });
  console.log("Status:", missingResult.status);
  console.log(JSON.stringify(missingResult.data, null, 2));

  const stopCount = await prisma.stop.count({ where: { tripId } });
  const tripActivityCount = await prisma.tripActivity.count({
    where: { stop: { tripId } },
  });
  console.log("\nCascade check: stops remaining =", stopCount);
  console.log("Cascade check: trip_activities remaining =", tripActivityCount);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
