import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.API_URL || "http://localhost:3001";
const prisma = new PrismaClient();

async function runTests() {
  console.log("=== 1. Setup standard user & admin user ===");
  const timestamp = Date.now();
  const standardEmail = `standard-${timestamp}@example.com`;
  const adminEmail = `admin-${timestamp}@example.com`;
  const password = "password123";

  // Register Standard User
  const standardSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Standard User",
      email: standardEmail,
      password,
    }),
  });
  const standardAuth = await standardSignupRes.json();
  const standardToken = standardAuth.token;
  console.log("Standard User created:", standardAuth.user.id);

  // Register Admin User
  const adminSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Admin User",
      email: adminEmail,
      password,
    }),
  });
  const adminAuth = await adminSignupRes.json();
  const adminUserId = adminAuth.user.id;
  const adminToken = adminAuth.token;

  // Grant admin rights to admin user
  await prisma.user.update({
    where: { id: adminUserId },
    data: { isAdmin: true },
  });
  console.log("Admin User created and granted isAdmin: true:", adminUserId);

  console.log("\n=== 2. GET /admin/stats — Test 403 Forbidden for Non-Admin ===");
  const forbiddenRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${standardToken}` },
  });
  console.log("Non-admin request status:", forbiddenRes.status, "(expect 403)");
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for standard user, got ${forbiddenRes.status}`);
  }

  console.log("\n=== 3. GET /admin/stats — Test 200 OK for Admin User ===");
  const adminRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("Admin request status:", adminRes.status, "(expect 200)");
  if (adminRes.status !== 200) {
    const text = await adminRes.text();
    throw new Error(`Expected 200 OK for admin user, got ${adminRes.status}: ${text}`);
  }

  const data = await adminRes.json();
  console.log("Admin Analytics Payload:", JSON.stringify(data, null, 2));

  if (!data.stats || typeof data.stats.totalTrips !== "number" || typeof data.stats.totalUsers !== "number") {
    throw new Error("Invalid admin stats structure returned.");
  }

  if (!Array.isArray(data.stats.topCities) || !Array.isArray(data.stats.topActivities) || !Array.isArray(data.stats.signupsOverTime)) {
    throw new Error("Missing arrays in admin stats response.");
  }

  console.log("\n✅ All Admin API integration tests passed!");

  // Cleanup test users
  await prisma.user.deleteMany({
    where: {
      id: { in: [standardAuth.user.id, adminUserId] },
    },
  });
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
