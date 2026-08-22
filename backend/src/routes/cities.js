import express from "express";

function serializeCity(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    cost_index: city.costIndex,
    popularity_score: city.popularityScore,
    image_url: city.imageUrl,
  };
}

export function createCitiesRouter(prisma) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const country =
        typeof req.query.country === "string" ? req.query.country.trim() : "";

      const where = {};

      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }

      if (country) {
        where.country = { equals: country, mode: "insensitive" };
      }

      const cities = await prisma.city.findMany({
        where,
        orderBy: [{ popularityScore: "desc" }, { name: "asc" }],
      });

      return res.json({ cities: cities.map(serializeCity) });
    } catch (error) {
      console.error("GET /cities", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
