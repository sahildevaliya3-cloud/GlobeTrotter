import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedCategories, seedCities } from "./seed-data.js";

const prisma = new PrismaClient();
const force = process.argv.includes("--force");

async function clearCatalog() {
  await prisma.tripActivity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
}

async function main() {
  const existingCities = await prisma.city.count();

  if (existingCities > 0 && !force) {
    console.log(
      `Found ${existingCities} cities already. Run with --force to replace catalog data.`
    );
    return;
  }

  if (existingCities > 0) {
    console.log("Clearing existing cities and activities...");
    await clearCatalog();
  }

  let totalActivities = 0;
  const categoryCounts = Object.fromEntries(
    seedCategories.map((category) => [category, 0])
  );

  for (const city of seedCities) {
    await prisma.city.create({
      data: {
        name: city.name,
        country: city.country,
        costIndex: city.costIndex,
        popularityScore: city.popularityScore,
        imageUrl: city.imageUrl,
        activities: {
          create: city.activities.map((activity) => {
            categoryCounts[activity.category] += 1;
            totalActivities += 1;
            return {
              name: activity.name,
              category: activity.category,
              cost: activity.cost,
              durationHours: activity.durationHours,
              description: activity.description,
              imageUrl: activity.imageUrl,
            };
          }),
        },
      },
    });
  }

  const cityCount = await prisma.city.count();
  const activityCount = await prisma.activity.count();

  console.log(`Seeded ${cityCount} cities and ${activityCount} activities.`);
  console.log("Activities by category:", categoryCounts);

  const samples = await prisma.city.findMany({
    take: 3,
    orderBy: { popularityScore: "desc" },
    include: {
      activities: {
        take: 2,
        orderBy: { name: "asc" },
      },
    },
  });

  console.log("\nSample records:");
  for (const city of samples) {
    console.log(
      `- ${city.name}, ${city.country} (cost_index=${city.costIndex}, popularity=${city.popularityScore})`
    );
    for (const activity of city.activities) {
      console.log(
        `    • [${activity.category}] ${activity.name} — $${activity.cost}, ${activity.durationHours}h`
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
