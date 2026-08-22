import express from "express";
import { isValidUuid } from "./trips.js";

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

function parseTime(value) {
  if (value == null || value === "") {
    return { value: new Date("1970-01-01T10:00:00.000Z") };
  }

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(value).trim());
  if (!match) {
    return { error: "scheduled_time must be in HH:MM format." };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return { error: "scheduled_time must be in HH:MM format." };
  }

  const padH = String(hours).padStart(2, "0");
  const padM = String(minutes).padStart(2, "0");
  return {
    value: new Date(`1970-01-01T${padH}:${padM}:00.000Z`),
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
      ? {
          id: tripActivity.activity.id,
          cityId: tripActivity.activity.cityId,
          name: tripActivity.activity.name,
          category: tripActivity.activity.category,
          cost: tripActivity.activity.cost,
          durationHours: tripActivity.activity.durationHours,
          duration_hours: tripActivity.activity.durationHours,
          description: tripActivity.activity.description,
          imageUrl: tripActivity.activity.imageUrl,
          image_url: tripActivity.activity.imageUrl,
        }
      : undefined,
  };
}

export function createTripActivitiesRouter(prisma) {
  const router = express.Router();

  router.put("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Trip activity not found." });
      }

      const existing = await prisma.tripActivity.findUnique({
        where: { id: req.params.id },
        include: {
          stop: {
            include: {
              trip: true,
            },
          },
          activity: true,
        },
      });

      if (!existing) {
        return res.status(404).json({ error: "Trip activity not found." });
      }

      if (existing.stop.trip.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You do not have access to this trip activity." });
      }

      const data = {};

      if (req.body?.scheduled_date !== undefined) {
        if (req.body.scheduled_date === null || req.body.scheduled_date === "") {
          return res.status(400).json({ error: "scheduled_date cannot be empty." });
        }
        const parsedDate = parseDateOnly(req.body.scheduled_date, "scheduled_date");
        if (parsedDate.error) {
          return res.status(400).json({ error: parsedDate.error });
        }
        data.scheduledDate = parsedDate.value;
      }

      if (req.body?.scheduled_time !== undefined) {
        const parsedTime = parseTime(req.body.scheduled_time);
        if (parsedTime.error) {
          return res.status(400).json({ error: parsedTime.error });
        }
        data.scheduledTime = parsedTime.value;
      }

      if (req.body?.custom_cost !== undefined) {
        if (req.body.custom_cost == null || req.body.custom_cost === "") {
          data.customCost = null;
        } else {
          const costVal = Number(req.body.custom_cost);
          if (Number.isNaN(costVal) || costVal < 0) {
            return res
              .status(400)
              .json({ error: "custom_cost must be a non-negative number." });
          }
          data.customCost = costVal;
        }
      }

      if (Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ error: "No valid fields provided to update." });
      }

      const updated = await prisma.tripActivity.update({
        where: { id: req.params.id },
        data,
        include: {
          activity: true,
        },
      });

      return res.json({
        tripActivity: serializeTripActivity(updated),
      });
    } catch (error) {
      console.error("PUT /trip-activities/:id", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Trip activity not found." });
      }

      const existing = await prisma.tripActivity.findUnique({
        where: { id: req.params.id },
        include: {
          stop: {
            include: {
              trip: true,
            },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({ error: "Trip activity not found." });
      }

      if (existing.stop.trip.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You do not have access to this trip activity." });
      }

      await prisma.tripActivity.delete({
        where: { id: req.params.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("DELETE /trip-activities/:id", error);
      return res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
