import { ServerError } from "@middlewares/errorHandler";
import { Event } from "@models/event.model";
import { User } from "@models/user.model";
import { logger } from "@utils/logger";
import { natsWrapper } from "@utils/natsWrapper";
import { Request, Response } from "express";
import { EventEmail, EventRegistered } from "@interfaces";

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        location,
        startDate,
        endDate,
        time,
        images,
        categories,
      } = req.body;

      const newEvent = new Event({
        name,
        description,
        location,
        startDate,
        endDate,
        time,
        images,
        categories,
        createdBy: req.currentUser!._id,
      });

      await newEvent.save();

      res.status(201).send(newEvent);
    } catch (err) {
      logger.error("Error creating event:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async searchEvents(req: Request, res: Response) {
    try {
      const {
        category,
        location,
        startDate,
        endDate,
        status,
        sort = "date",
        page = 1,
        limit = 10,
      } = req.query;

      const query: any = {};
      if (category) {
        query.categories = category;
      }
      if (location) {
        query.location = location;
      }
      if (status) {
        query.status = status;
      }
      if (startDate) {
        query.startDate = { $gte: new Date(startDate as string) };
      }
      if (endDate) {
        query.endDate = { $lte: new Date(endDate as string) };
      }

      const options = {
        skip: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
        sort: {},
        populate: [
          { path: "createdBy", select: "firstName lastName email userId" },
          { path: "attendees", select: "firstName lastName email userId" },
        ],
      };

      if (sort) {
        if (sort === "date") {
          options.sort = { startDate: 1 };
        } else if (sort === "popularity") {
          options.sort = { "attendees.length": -1 };
        }
      }

      const events = await Event.find(query, null, options);

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

  async registerEvent(req: Request, res: Response) {
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

      const registerEventEmail: EventEmail = {
        EmailType: "confirmation",
        Recipients: [user.email],
        Subject: "Confirmation Email",
        Data: {
          EventName: event.name,
          Name: user.userName,
          EventDate: event.startDate,
        },
      };
      natsWrapper.publish("email.send", registerEventEmail);

      const eventRegistered: EventRegistered = {
        user: {
          email: user.email,
          name: user.userName,
        },
        event: {
          name: event.name,
          date: event.startDate,
        },
      };
      natsWrapper.publish("event.registered", eventRegistered);

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

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await Event.distinct("categories");
      res.status(200).send(categories);
    } catch (err) {
      logger.error("Error fetching categories:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  async getLocations(req: Request, res: Response) {
    try {
      const locations = await Event.distinct("location");
      res.status(200).send(locations);
    } catch (err) {
      logger.error("Error fetching locations:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}
