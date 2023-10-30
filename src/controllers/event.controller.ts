import { ServerError } from "@middlewares/errorHandler";
import { Event } from "@models/event.model";
import { User } from "@models/user.model";
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
        .populate("createdBy", "firstName lastName email userId")
        .populate("attendees", "firstName lastName email userId");

      if (!events) {
        throw new ServerError("No events found", 404);
      }

      res.status(200).send(events);
    } catch (err) {
      logger.error("Error fetching events:", err);
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const event = await Event.findById(eventId)
        .populate("createdBy", "firstName lastName email userId")
        .populate("attendees", "firstName lastName email userId");

      if (!event) {
        throw new ServerError("Event not found", 404);
      }

      res.status(200).send(event);
    } catch (err) {
      logger.error("Error fetching event:", err);
      if (err instanceof ServerError) {
        console.log('a')
        console.log(err.serializeErrors())
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
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
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId);
      if (!event) {
        throw new ServerError("Event not found", 404);
      }
      if (event.createdBy.toString() !== req.currentUser!._id.toString()) {
        throw new ServerError("Not authorized to delete this event", 403);
      }

      await Event.findByIdAndDelete(eventId);
      res.status(204).send();
    } catch (err) {
      logger.error("Error deleting event:", err);
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async viewAttendees(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId).populate("attendees");

      if (!event) {
        throw new ServerError("Event not found", 404);
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
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const userId = req.currentUser!._id;

      const event = await Event.findById(eventId);

      if (!event) {
        throw new ServerError("Event not found", 404);
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new ServerError("User not found", 404);
      }

      if (event.attendees.includes(userId)) {
        throw new ServerError("User already registered for the event", 400);
      }

      event.attendees.push(userId);
      user.events.push(event._id);

      await event.save();
      await user.save();

      res
        .status(200)
        .send({ message: "Successfully registered for the event" });
    } catch (err) {
      logger.error("Error registering for event:", err);
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}
