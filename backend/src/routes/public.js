import express from "express";
import { serializeTrip } from "./trips.js";

export function createPublicRouter(prisma) {
  const router = express.Router();

  router.get("/:shareSlug", async (req, res) => {
    try {
      const shareSlug = String(req.params.shareSlug || "").trim();
      if (!shareSlug) {
        return res.status(404).json({ error: "Trip not found." });
      }

      const trip = await prisma.trip.findFirst({
        where: {
          shareSlug,
          isPublic: true,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          stops: {
            orderBy: { orderIndex: "asc" },
            include: {
              city: true,
              tripActivities: {
                orderBy: { scheduledDate: "asc" },
                include: {
                  activity: true,
                },
              },
            },
          },
        },
      });

      if (!trip) {
        return res
          .status(404)
          .json({ error: "Shared trip not found or is private." });
      }

      return res.json({
        trip: serializeTrip(trip, { includeStops: true }),
      });
    } catch (error) {
      console.error("GET /public/:shareSlug", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
