import { Router } from "express";

export function createAdminRouter(prisma) {
  const router = Router();

  router.get("/stats", async (req, res) => {
    try {
      // Check admin status
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, isAdmin: true },
      });

      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // 1. Total trips created
      const totalTrips = await prisma.trip.count();

      // 2. Total user count
      const totalUsers = await prisma.user.count();

      // 3. Top 10 most-added cities
      const cityGroups = await prisma.stop.groupBy({
        by: ["cityId"],
        _count: {
          cityId: true,
        },
        orderBy: {
          _count: {
            cityId: "desc",
          },
        },
        take: 10,
      });

      const cityIds = cityGroups.map((g) => g.cityId);
      const cities = await prisma.city.findMany({
        where: { id: { in: cityIds } },
        select: { id: true, name: true, country: true },
      });

      const cityMap = new Map(cities.map((c) => [c.id, c]));
      const topCities = cityGroups
        .map((g) => {
          const city = cityMap.get(g.cityId);
          return {
            id: g.cityId,
            name: city?.name ?? "Unknown City",
            country: city?.country ?? "—",
            count: g._count.cityId,
          };
        })
        .filter((c) => c.count > 0);

      // 4. Top 10 most-added activities
      const activityGroups = await prisma.tripActivity.groupBy({
        by: ["activityId"],
        _count: {
          activityId: true,
        },
        orderBy: {
          _count: {
            activityId: "desc",
          },
        },
        take: 10,
      });

      const activityIds = activityGroups.map((g) => g.activityId);
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, name: true, category: true },
      });

      const activityMap = new Map(activities.map((a) => [a.id, a]));
      const topActivities = activityGroups
        .map((g) => {
          const activity = activityMap.get(g.activityId);
          return {
            id: g.activityId,
            name: activity?.name ?? "Unknown Activity",
            category: activity?.category ?? "general",
            count: g._count.activityId,
          };
        })
        .filter((a) => a.count > 0);

      // 5. User signups over time (grouped by YYYY-MM-DD)
      const allUsers = await prisma.user.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      const signupsMap = new Map();
      for (const u of allUsers) {
        const dateStr = u.createdAt.toISOString().split("T")[0];
        signupsMap.set(dateStr, (signupsMap.get(dateStr) || 0) + 1);
      }

      const signupsOverTime = Array.from(signupsMap.entries()).map(
        ([date, count]) => ({
          date,
          count,
        })
      );

      return res.json({
        stats: {
          totalTrips,
          totalUsers,
          topCities,
          topActivities,
          signupsOverTime,
        },
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      return res.status(500).json({ error: "Failed to load admin analytics." });
    }
  });

  return router;
}
