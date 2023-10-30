import { ServerError } from "@middlewares/errorHandler";
import { Event } from "@models/event.model";
import { logger } from "@utils/logger";
import { Request, Response } from "express";

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const { name, description, location, date, time, images } = req.body;

      const newEvent = new Event({
        name,
        description,
        location,
        date,
        time,
        images,
        createdBy: req.currentUser!._id,
      });

      await newEvent.save();

      res.status(201).send(newEvent);
    } catch (err) {
      logger.error("Error creating event:", err);
      throw new ServerError("Internal Server Error", 500);
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const events = await Event.find()
        .populate("createdBy", "firstName lastName email")
        .populate("attendees", "firstName lastName email");

      res.status(200).send(events);
    } catch (err) {
      logger.error("Error fetching events:", err);
      throw new ServerError("Internal Server Error", 500);
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const updates = req.body;

      const event = await Event.findById(eventId);

      if (!event) {
        throw new ServerError("Event not found", 404);
      }

      if (event.createdBy.toString() !== req.currentUser!._id.toString()) {
        throw new ServerError("Not authorized to update this event", 403);
      }

      Object.assign(event, updates);
      await event.save();

      res.send(event);
    } catch (err) {
      logger.error("Error updating event:", err);
      throw new ServerError("Internal Server Error", 500);
    }
  }

  async viewAttendees(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId).populate("attendees");

      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

      if (event.createdBy.toString() !== req.currentUser!._id.toString()) {
        throw new ServerError(
          "Not authorized to view attendees of this event",
          403
        );
      }

      res.send(event.attendees);
    } catch (err) {
      logger.error("Error viewing attendees:", err);
      throw new ServerError("Internal Server Error", 500);
    }
  }

  async attendEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const userId = req.currentUser!._id;

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { attendees: userId } },
        { new: true }
      ).populate("attendees", "firstName lastName email");

      if (!updatedEvent) {
        throw new ServerError("Event not found", 404);
      }

      res.status(200).send(updatedEvent);
    } catch (err) {
      logger.error("Error attending event:", err);
      throw new ServerError("Internal Server Error", 500);
    }
  }
}
