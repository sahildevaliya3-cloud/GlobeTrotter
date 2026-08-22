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
    name: "Stops Demo",
    email: `stops-${Date.now()}@example.com`,
    password: "secret123",
  },
});
const token = signup.data.token;

const trip = await request("/trips", {
  method: "POST",
  token,
  body: {
    name: "Itinerary Demo",
    start_date: "2026-09-01",
    end_date: "2026-09-14",
  },
});

const cities = await request("/cities?country=France", { token });
const cityId = cities.data.cities[0].id;

const stop = await request(`/trips/${trip.data.trip.id}/stops`, {
  method: "POST",
  token,
  body: { city_id: cityId },
});

console.log("PUT /stops/:id", await request(`/stops/${stop.data.stop.id}`, {
  method: "PUT",
  token,
  body: { start_date: "2026-09-02", end_date: "2026-09-05" },
}));

console.log("DELETE /stops/:id", await request(`/stops/${stop.data.stop.id}`, {
  method: "DELETE",
  token,
}));

console.log("GET /trips/:id", await request(`/trips/${trip.data.trip.id}`, { token }));
