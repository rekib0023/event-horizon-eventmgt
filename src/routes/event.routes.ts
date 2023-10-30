import { EventController } from "@controllers/event.controller";
import { requireAuth } from "@middlewares/requireAuth";
import express from "express";

const router = express.Router();

const eventController = new EventController();

router.get("/events", requireAuth, eventController.getEvents);
router.post("/events", requireAuth, eventController.createEvent);
router.put("/events/:eventId", requireAuth, eventController.updateEvent);
router.get(
  "/events/:eventId/attendees",
  requireAuth,
  eventController.viewAttendees
);
router.post(
  "/events/:eventId/attend",
  requireAuth,
  eventController.attendEvent
);

export { router as eventRoutes };
