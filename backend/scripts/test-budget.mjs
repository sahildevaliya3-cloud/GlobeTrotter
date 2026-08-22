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
  logStep("1. Setup user & create trip with target_budget");
  const ownerEmail = `budget-user-${Date.now()}@example.com`;
  const ownerToken = await signup(ownerEmail, "Budget Tester");

  const createRes = await request("/trips", {
    method: "POST",
    token: ownerToken,
    body: {
      name: "Tokyo Adventure",
      start_date: "2026-10-01",
      end_date: "2026-10-05", // 5 days
      target_budget: 150,
    },
  });

  console.log("Create trip status:", createRes.status);
  if (createRes.status !== 201) {
    throw new Error("Create trip failed");
  }

  const tripId = createRes.data.trip.id;
  console.log("Trip created:", createRes.data.trip);

  logStep("2. Seed cities, stops & activities");
  const city = await prisma.city.create({
    data: {
      name: "Tokyo",
      country: "Japan",
      costIndex: 1.5,
      popularityScore: 98,
    },
  });

  const foodAct = await prisma.activity.create({
    data: {
      cityId: city.id,
      name: "Ramen Tasting Tour",
      category: "food",
      cost: 40.0,
      durationHours: 2,
    },
  });

  const sightAct = await prisma.activity.create({
    data: {
      cityId: city.id,
      name: "Tokyo Tower",
      category: "sightseeing",
      cost: 30.0,
      durationHours: 2,
    },
  });

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId: city.id,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      orderIndex: 0,
    },
  });

  // Food activity (standard cost $40)
  await prisma.tripActivity.create({
    data: {
      stopId: stop.id,
      activityId: foodAct.id,
      scheduledDate: new Date("2026-10-01"),
      scheduledTime: new Date("1970-01-01T12:00:00.000Z"),
    },
  });

  // Sightseeing activity (custom cost override $120)
  await prisma.tripActivity.create({
    data: {
      stopId: stop.id,
      activityId: sightAct.id,
      scheduledDate: new Date("2026-10-02"),
      scheduledTime: new Date("1970-01-01T15:00:00.000Z"),
      customCost: 120.0,
    },
  });

  logStep("3. GET /trips/:id/budget");
  const budgetRes = await request(`/trips/${tripId}/budget`, {
    token: ownerToken,
  });

  console.log("Budget status:", budgetRes.status);
  console.log("Budget data:", JSON.stringify(budgetRes.data, null, 2));

  if (budgetRes.status !== 200) {
    throw new Error("GET /trips/:id/budget failed");
  }

  const b = budgetRes.data.budget;
  // totalCost = 40 + 120 = 160
  // targetBudget = 150 -> isOverBudget = true
  // numberOfDays = 5 -> averageCostPerDay = 160 / 5 = 32
  if (b.totalCost !== 160) throw new Error(`Expected totalCost 160, got ${b.totalCost}`);
  if (b.numberOfDays !== 5) throw new Error(`Expected 5 days, got ${b.numberOfDays}`);
  if (b.averageCostPerDay !== 32) throw new Error(`Expected averageCostPerDay 32, got ${b.averageCostPerDay}`);
  if (b.isOverBudget !== true) throw new Error("Expected isOverBudget to be true");

  logStep("4. Update target budget via PUT /trips/:id");
  const updateRes = await request(`/trips/${tripId}`, {
    method: "PUT",
    token: ownerToken,
    body: {
      target_budget: 200,
    },
  });

  console.log("Update trip status:", updateRes.status);
  if (updateRes.status !== 200) throw new Error("Update target_budget failed");

  const budgetRes2 = await request(`/trips/${tripId}/budget`, {
    token: ownerToken,
  });

  console.log("Updated Budget data:", JSON.stringify(budgetRes2.data, null, 2));
  if (budgetRes2.data.budget.isOverBudget !== false) {
    throw new Error("Expected isOverBudget to be false after increasing budget to 200");
  }

  console.log("\n✅ All backend budget tests passed!");
}

main()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
