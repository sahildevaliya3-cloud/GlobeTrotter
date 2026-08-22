import express from "express";
import { isValidUuid } from "./trips.js";

function serializeActivity(activity) {
  return {
    id: activity.id,
    name: activity.name,
    category: activity.category,
    cost: activity.cost,
    duration_hours: activity.durationHours,
    description: activity.description,
    image_url: activity.imageUrl,
  };
}

export function createActivitiesRouter(prisma) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const cityId =
        typeof req.query.city_id === "string" ? req.query.city_id.trim() : "";
      const category =
        typeof req.query.category === "string" ? req.query.category.trim() : "";
      const maxCostRaw =
        typeof req.query.maxCost === "string" ? req.query.maxCost.trim() : "";

      const where = {};

      if (cityId) {
        if (!isValidUuid(cityId)) {
          return res.status(400).json({ error: "city_id must be a valid UUID." });
        }
        where.cityId = cityId;
      }

      if (category) {
        where.category = { equals: category, mode: "insensitive" };
      }

      if (maxCostRaw) {
        const maxCost = Number(maxCostRaw);
        if (Number.isNaN(maxCost) || maxCost < 0) {
          return res.status(400).json({ error: "maxCost must be a non-negative number." });
        }
        where.cost = { lte: maxCost };
      }

      const activities = await prisma.activity.findMany({
        where,
        orderBy: [{ cost: "asc" }, { name: "asc" }],
      });

      return res.json({ activities: activities.map(serializeActivity) });
    } catch (error) {
      console.error("GET /activities", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
