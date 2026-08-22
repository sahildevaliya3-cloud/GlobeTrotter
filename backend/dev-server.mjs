/**
 * dev-server.mjs — Single entry point for local development.
 * Starts embedded PostgreSQL then launches the Express API with --watch.
 */
import EmbeddedPostgres from "embedded-postgres";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, ".pgdata");

// ── 1. Start embedded PostgreSQL ──────────────────────────────────────────────
const postgres = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "globetrotter",
  port: 5432,
  persistent: true,
  initdbFlags: ["-E", "UTF8", "--locale=C"],
});

try {
  await postgres.initialise();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (!/not empty/i.test(msg) && !/already exists/i.test(msg)) throw err;
}

await postgres.start();

try {
  await postgres.createDatabase("globetrotter");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (!/already exists/i.test(msg)) throw err;
}

console.log("✅ PostgreSQL running on localhost:5432 (database: globetrotter)");

// ── 2. Launch Express with --watch (hot-reload) ───────────────────────────────
const api = spawn(
  process.execPath,         // path to current node binary
  ["--watch", "src/index.js"],
  { cwd: __dirname, stdio: "inherit", env: process.env }
);

api.on("exit", (code) => {
  console.log(`Express exited (${code}). Stopping PostgreSQL…`);
  postgres.stop().then(() => process.exit(code ?? 0));
});

// ── 3. Graceful shutdown on Ctrl+C ───────────────────────────────────────────
process.on("SIGINT", async () => {
  api.kill("SIGINT");
  await postgres.stop();
  process.exit(0);
});
