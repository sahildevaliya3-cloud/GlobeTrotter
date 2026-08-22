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
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

async function main() {
  const email = `cities-demo-${Date.now()}@example.com`;
  const signup = await request("/auth/signup", {
    method: "POST",
    body: { name: "Cities Demo", email, password: "secret123" },
  });
  const token = signup.data.token;

  const trip = await request("/trips", {
    method: "POST",
    token,
    body: {
      name: "City Search Trip",
      start_date: "2026-09-01",
      end_date: "2026-09-10",
    },
  });

  console.log("GET /cities?search=par");
  console.log(await request("/cities?search=par", { token }));

  console.log("\nGET /cities?country=France");
  console.log(await request("/cities?country=France", { token }));

  const france = await request("/cities?country=France", { token });
  const cityId = france.data.cities[0].id;

  console.log("\nPOST /trips/:id/stops");
  console.log(
    await request(`/trips/${trip.data.trip.id}/stops`, {
      method: "POST",
      token,
      body: { city_id: cityId },
    })
  );
}

main().catch(console.error);
