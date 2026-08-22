import express from "express";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseDateOnly(value, fieldName) {
  if (value == null || value === "") {
    return { error: `${fieldName} is required.` };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `${fieldName} must be a valid date.` };
  }

  return { value: parsed };
}

function serializeActivity(activity) {
  return {
    id: activity.id,
    cityId: activity.cityId,
    name: activity.name,
    category: activity.category,
    cost: activity.cost,
    durationHours: activity.durationHours,
    description: activity.description,
    imageUrl: activity.imageUrl,
  };
}

function serializeTripActivity(tripActivity) {
  return {
    id: tripActivity.id,
    stopId: tripActivity.stopId,
    activityId: tripActivity.activityId,
    scheduledDate: tripActivity.scheduledDate,
    scheduledTime: tripActivity.scheduledTime,
    customCost: tripActivity.customCost,
    activity: tripActivity.activity
      ? serializeActivity(tripActivity.activity)
      : undefined,
  };
}

function serializeStop(stop) {
  return {
    id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId,
    startDate: stop.startDate,
    endDate: stop.endDate,
    orderIndex: stop.orderIndex,
    city: stop.city
      ? {
          id: stop.city.id,
          name: stop.city.name,
          country: stop.city.country,
          costIndex: stop.city.costIndex,
          popularityScore: stop.city.popularityScore,
          imageUrl: stop.city.imageUrl,
        }
      : undefined,
    tripActivities: stop.tripActivities?.map(serializeTripActivity),
  };
}

export function serializeTrip(trip, { includeStops = false } = {}) {
  const serialized = {
    id: trip.id,
    userId: trip.userId,
    name: trip.name,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverPhotoUrl: trip.coverPhotoUrl,
    isPublic: trip.isPublic,
    createdAt: trip.createdAt,
  };

  if (includeStops) {
    serialized.stops = trip.stops?.map(serializeStop) ?? [];
  }

  return serialized;
}

export function isValidUuid(value) {
  return UUID_PATTERN.test(value);
}

export function buildTripWriteData(body, { partial = false } = {}) {
  const data = {};
  const errors = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push("name is required.");
    } else {
      data.name = body.name.trim();
    }
  }

  if (!partial || body.description !== undefined) {
    data.description =
      body.description == null || body.description === ""
        ? null
        : String(body.description);
  }

  if (!partial || body.start_date !== undefined) {
    const startDate = parseDateOnly(body.start_date, "start_date");
    if (startDate.error) errors.push(startDate.error);
    else data.startDate = startDate.value;
  }

  if (!partial || body.end_date !== undefined) {
    const endDate = parseDateOnly(body.end_date, "end_date");
    if (endDate.error) errors.push(endDate.error);
    else data.endDate = endDate.value;
  }

  if (body.cover_photo_url !== undefined) {
    data.coverPhotoUrl =
      body.cover_photo_url == null || body.cover_photo_url === ""
        ? null
        : String(body.cover_photo_url);
  }

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.push("end_date must be on or after start_date.");
  }

  return { data, errors };
}

export function createTripsRouter(prisma) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const trips = await prisma.trip.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { stops: true } },
        },
      });

      return res.json({
        trips: trips.map((trip) => ({
          ...serializeTrip(trip),
          stopCount: trip._count.stops,
        })),
      });
    } catch (error) {
      console.error("GET /trips", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { data, errors } = buildTripWriteData(req.body ?? {});

      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] });
      }

      const trip = await prisma.trip.create({
        data: {
          ...data,
          userId: req.user.id,
        },
      });

      return res.status(201).json({ trip: serializeTrip(trip) });
    } catch (error) {
      console.error("POST /trips", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Trip not found." });
      }

      const trip = await prisma.trip.findUnique({
        where: { id: req.params.id },
        include: {
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
        return res.status(404).json({ error: "Trip not found." });
      }

      if (trip.userId !== req.user.id) {
        return res.status(403).json({ error: "You do not have access to this trip." });
      }

      return res.json({ trip: serializeTrip(trip, { includeStops: true }) });
    } catch (error) {
      console.error("GET /trips/:id", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Trip not found." });
      }

      const existing = await prisma.trip.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Trip not found." });
      }

      if (existing.userId !== req.user.id) {
        return res.status(403).json({ error: "You do not have access to this trip." });
      }

      const { data, errors } = buildTripWriteData(req.body ?? {}, { partial: true });

      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] });
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
      }

      const nextStartDate = data.startDate ?? existing.startDate;
      const nextEndDate = data.endDate ?? existing.endDate;
      if (nextEndDate < nextStartDate) {
        return res.status(400).json({ error: "end_date must be on or after start_date." });
      }

      const trip = await prisma.trip.update({
        where: { id: req.params.id },
        data,
      });

      return res.json({ trip: serializeTrip(trip) });
    } catch (error) {
      console.error("PUT /trips/:id", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Trip not found." });
      }

      const existing = await prisma.trip.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        return res.status(404).json({ error: "Trip not found." });
      }

      if (existing.userId !== req.user.id) {
        return res.status(403).json({ error: "You do not have access to this trip." });
      }

      await prisma.trip.delete({
        where: { id: req.params.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("DELETE /trips/:id", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
