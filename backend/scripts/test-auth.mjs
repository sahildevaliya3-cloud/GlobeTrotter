import "dotenv/config";

const API_URL = process.env.API_URL || "http://localhost:3001";
const testEmail = `auth-demo-${Date.now()}@example.com`;
const password = "secret123";

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

async function main() {
  logStep("POST /auth/signup (201)");
  const signup = await request("/auth/signup", {
    method: "POST",
    body: { name: "Auth Demo User", email: testEmail, password },
  });
  console.log("Status:", signup.status);
  console.log(JSON.stringify(signup.data, null, 2));

  if (signup.status !== 201 || !signup.data?.token) {
    throw new Error("Signup failed");
  }

  const token = signup.data.token;

  logStep("POST /auth/signup duplicate email (409)");
  const duplicate = await request("/auth/signup", {
    method: "POST",
    body: { name: "Another User", email: testEmail, password },
  });
  console.log("Status:", duplicate.status);
  console.log(JSON.stringify(duplicate.data, null, 2));

  logStep("POST /auth/signup invalid email (400)");
  const badEmail = await request("/auth/signup", {
    method: "POST",
    body: { name: "Bad Email", email: "not-an-email", password },
  });
  console.log("Status:", badEmail.status);
  console.log(JSON.stringify(badEmail.data, null, 2));

  logStep("POST /auth/signup short password (400)");
  const shortPassword = await request("/auth/signup", {
    method: "POST",
    body: { name: "Short Pass", email: `short-${Date.now()}@example.com`, password: "123" },
  });
  console.log("Status:", shortPassword.status);
  console.log(JSON.stringify(shortPassword.data, null, 2));

  logStep("POST /auth/login (200)");
  const login = await request("/auth/login", {
    method: "POST",
    body: { email: testEmail, password },
  });
  console.log("Status:", login.status);
  console.log(JSON.stringify(login.data, null, 2));

  logStep("POST /auth/login wrong password (401)");
  const badLogin = await request("/auth/login", {
    method: "POST",
    body: { email: testEmail, password: "wrong-password" },
  });
  console.log("Status:", badLogin.status);
  console.log(JSON.stringify(badLogin.data, null, 2));

  logStep("GET /trips with valid token (200)");
  const authed = await request("/trips", { token });
  console.log("Status:", authed.status);
  console.log(JSON.stringify(authed.data, null, 2));

  logStep("GET /trips without token (401)");
  const noToken = await request("/trips");
  console.log("Status:", noToken.status);
  console.log(JSON.stringify(noToken.data, null, 2));

  logStep("GET /trips with invalid token (401)");
  const badToken = await request("/trips", { token: "invalid.jwt.token" });
  console.log("Status:", badToken.status);
  console.log(JSON.stringify(badToken.data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
