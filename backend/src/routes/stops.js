import express from "express";
import { isValidUuid, serializeStop } from "./trips.js";

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

function buildStopUpdateData(body) {
  const data = {};
  const errors = [];

  if (body.start_date !== undefined) {
    const startDate = parseDateOnly(body.start_date, "start_date");
    if (startDate.error) errors.push(startDate.error);
    else data.startDate = startDate.value;
  }

  if (body.end_date !== undefined) {
    const endDate = parseDateOnly(body.end_date, "end_date");
    if (endDate.error) errors.push(endDate.error);
    else data.endDate = endDate.value;
  }

  if (body.order_index !== undefined) {
    const orderIndex = Number(body.order_index);
    if (!Number.isInteger(orderIndex) || orderIndex < 0) {
      errors.push("order_index must be a non-negative integer.");
    } else {
      data.orderIndex = orderIndex;
    }
  }

  return { data, errors };
}

async function findOwnedStop(prisma, stopId, userId) {
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: {
      trip: true,
      city: true,
    },
  });

  if (!stop) {
    return { status: 404, error: "Stop not found." };
  }

  if (stop.trip.userId !== userId) {
    return { status: 403, error: "You do not have access to this stop." };
  }

  return { stop };
}

function parseTime(value) {
  if (value == null || value === "") {
    return { value: new Date("1970-01-01T10:00:00.000Z") };
  }

  const match = /^(\d{2}):(\d{2})$/.exec(String(value));
  if (!match) {
    return { error: "scheduled_time must be in HH:MM format." };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return { error: "scheduled_time must be in HH:MM format." };
  }

  return {
    value: new Date(`1970-01-01T${match[1]}:${match[2]}:00.000Z`),
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
          name: tripActivity.activity.name,
          category: tripActivity.activity.category,
          cost: tripActivity.activity.cost,
          duration_hours: tripActivity.activity.durationHours,
          description: tripActivity.activity.description,
          image_url: tripActivity.activity.imageUrl,
        }
      : undefined,
  };
}

export function createStopsRouter(prisma) {
  const router = express.Router();

  router.post("/:id/activities", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Stop not found." });
      }

      const owned = await findOwnedStop(prisma, req.params.id, req.user.id);
      if (owned.error) {
        return res.status(owned.status).json({ error: owned.error });
      }

      const { activity_id: activityId, scheduled_date, scheduled_time } = req.body ?? {};

      if (!activityId || !isValidUuid(activityId)) {
        return res.status(400).json({ error: "A valid activity_id is required." });
      }

      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        return res.status(404).json({ error: "Activity not found." });
      }

      if (activity.cityId !== owned.stop.cityId) {
        return res.status(400).json({
          error: "This activity does not belong to the stop's city.",
        });
      }

      const existing = await prisma.tripActivity.findFirst({
        where: { stopId: owned.stop.id, activityId },
      });

      if (existing) {
        return res.status(409).json({ error: "This activity is already on the stop." });
      }

      let scheduledDate = owned.stop.startDate;
      if (scheduled_date !== undefined && scheduled_date !== null && scheduled_date !== "") {
        const parsedDate = parseDateOnly(scheduled_date, "scheduled_date");
        if (parsedDate.error) {
          return res.status(400).json({ error: parsedDate.error });
        }
        scheduledDate = parsedDate.value;
      }

      const parsedTime = parseTime(scheduled_time);
      if (parsedTime.error) {
        return res.status(400).json({ error: parsedTime.error });
      }

      const tripActivity = await prisma.tripActivity.create({
        data: {
          stopId: owned.stop.id,
          activityId,
          scheduledDate,
          scheduledTime: parsedTime.value,
        },
        include: { activity: true },
      });

      return res.status(201).json({
        tripActivity: serializeTripActivity(tripActivity),
      });
    } catch (error) {
      console.error("POST /stops/:id/activities", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Stop not found." });
      }

      const owned = await findOwnedStop(prisma, req.params.id, req.user.id);
      if (owned.error) {
        return res.status(owned.status).json({ error: owned.error });
      }

      const { data, errors } = buildStopUpdateData(req.body ?? {});
      if (errors.length > 0) {
        return res.status(400).json({ error: errors[0] });
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No valid fields provided to update." });
      }

      const nextStartDate = data.startDate ?? owned.stop.startDate;
      const nextEndDate = data.endDate ?? owned.stop.endDate;
      if (nextEndDate < nextStartDate) {
        return res.status(400).json({ error: "end_date must be on or after start_date." });
      }

      const stop = await prisma.stop.update({
        where: { id: req.params.id },
        data,
        include: { city: true },
      });

      return res.json({ stop: serializeStop(stop) });
    } catch (error) {
      console.error("PUT /stops/:id", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!isValidUuid(req.params.id)) {
        return res.status(404).json({ error: "Stop not found." });
      }

      const owned = await findOwnedStop(prisma, req.params.id, req.user.id);
      if (owned.error) {
        return res.status(owned.status).json({ error: owned.error });
      }

      await prisma.stop.delete({
        where: { id: req.params.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("DELETE /stops/:id", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

  return router;
}
