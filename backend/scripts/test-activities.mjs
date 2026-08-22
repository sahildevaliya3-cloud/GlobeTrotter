import "dotenv/config";

const API_URL = process.env.API_URL || "http://localhost:3001";

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
  const data = text ? JSON.parse(text) : null;
  return { status: response.status, data };
}

const signup = await request("/auth/signup", {
  method: "POST",
  body: {
    name: "Activities Demo",
    email: `activities-${Date.now()}@example.com`,
    password: "secret123",
  },
});
const token = signup.data.token;

const trip = await request("/trips", {
  method: "POST",
  token,
  body: { name: "Activity Trip", start_date: "2026-09-01", end_date: "2026-09-10" },
});

const cities = await request("/cities?country=France", { token });
const cityId = cities.data.cities[0].id;

const stop = await request(`/trips/${trip.data.trip.id}/stops`, {
  method: "POST",
  token,
  body: { city_id: cityId },
});

console.log("GET /activities?city_id=&category=food&maxCost=50");
console.log(
  await request(
    `/activities?city_id=${cityId}&category=food&maxCost=50`,
    { token }
  )
);

const activities = await request(`/activities?city_id=${cityId}`, { token });
const activityId = activities.data.activities[0].id;

console.log("\nPOST /stops/:id/activities");
console.log(
  await request(`/stops/${stop.data.stop.id}/activities`, {
    method: "POST",
    token,
    body: {
      activity_id: activityId,
      scheduled_date: "2026-09-02",
      scheduled_time: "14:30",
    },
  })
);
