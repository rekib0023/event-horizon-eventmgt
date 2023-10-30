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
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const events = await Event.find()
        .populate("createdBy", "firstName lastName email")
        .populate("attendees", "firstName lastName email");

      if (!events) {
        return res.status(404).send({ errors: "No events found" });
      }

      res.status(200).send(events);
    } catch (err) {
      logger.error("Error fetching events:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate("createdBy", "firstName lastName email")
        .populate("attendees", "firstName lastName email");

      if (!event) {
        return res.status(404).send({ errors: "Event not found" });
      }

      res.status(200).send(event);
    } catch (err) {
      logger.error("Error fetching event:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const updates = req.body;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).send({ errors: "Event not found" });
      }

      if (event.createdBy.toString() !== req.currentUser!._id.toString()) {
        res.status(403).send({ errors: "Not authorized to update this event" });
      }

      Object.assign(event, updates);
      await event.save();

      res.send(event);
    } catch (err) {
      logger.error("Error updating event:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).send({ errors: "Event not found" });
      }

      if (event.createdBy.toString() !== req.currentUser!._id.toString()) {
        return res
          .status(403)
          .send({ errors: "Not authorized to delete this event" });
      }

      await Event.findByIdAndDelete(eventId);
      res.status(204).send();
    } catch (err) {
      logger.error("Error deleting event:", err);
      return res.status(500).send({ error: "Internal Server Error" });
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
        return res.status(403).send({
          errors: "Not authorized to view attendees of this event",
        });
      }

      res.send(event.attendees);
    } catch (err) {
      logger.error("Error viewing attendees:", err);
      return res.status(500).send({ error: "Internal Server Error" });
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
        return res.status(404).send({ errors: "Event not found" });
      }

      res.status(200).send(updatedEvent);
    } catch (err) {
      logger.error("Error attending event:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}
