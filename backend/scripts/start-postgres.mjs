import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, "..", ".pgdata");

const postgres = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "globetrotter",
  port: 5432,
  persistent: true,
  initdbFlags: ["-E", "UTF8", "--locale=C"],
});

await postgres.initialise();
await postgres.start();

try {
  await postgres.createDatabase("globetrotter");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/already exists/i.test(message)) {
    throw error;
  }
}

console.log("PostgreSQL is running on localhost:5432 (database: globetrotter)");

const keepAlive = setInterval(() => {}, 1 << 30);
process.on("SIGINT", async () => {
  clearInterval(keepAlive);
  await postgres.stop();
  process.exit(0);
});
