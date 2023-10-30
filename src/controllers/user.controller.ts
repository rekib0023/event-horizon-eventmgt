import { ServerError } from "@middlewares/errorHandler";
import { Event, EventStatus } from "@models/event.model";
import { User } from "@models/user.model";
import { logger } from "@utils/logger";
import { Request, Response } from "express";

export class UserController {
  async getUserEvents(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      if (!userId) {
        throw new ServerError("User ID is required", 400);
      }

      const user = await User.findOne({
        userId: userId,
      });
      if (!user) {
        throw new ServerError("User not found", 404);
      }

      const uId = user._id;

      let events;

      switch (status) {
        case EventStatus.UPCOMING:
          events = await Event.find({
            attendees: uId,
            status: status || EventStatus.UPCOMING,
          })
            .populate("createdBy", "firstName lastName email userId")
            .select("-attendees");

          break;
        case EventStatus.CANCELLED:
          events = await Event.find({
            attendees: uId,
            status: EventStatus.CANCELLED,
          })
            .populate("createdBy", "firstName lastName email userId")
            .select("-attendees");

          break;
        case EventStatus.ONGOING:
          events = await Event.find({
            createdBy: uId,
            status: status || EventStatus.ONGOING,
          })
            .populate("createdBy", "firstName lastName email userId")
            .select("-attendees");

          break;
        case EventStatus.COMPLETED:
          events = await Event.find({
            attendees: uId,
            status: status || EventStatus.COMPLETED,
          })
            .populate("createdBy", "firstName lastName email userId")
            .select("-attendees");

          break;

        default:
          events = await Event.find({
            attendees: uId,
          })
            .populate("createdBy", "firstName lastName email userId")
            .select("-attendees");
      }

      res.status(200).send(events);
    } catch (err) {
      logger.error("Error fetching upcoming events:", err);
      if (err instanceof ServerError) {
        return res
          .status(err.statusCode)
          .send({ errors: err.serializeErrors() });
      }
      return res
        .status(500)
        .send({ errors: [{ message: "Internal Server Error" }] });
    }
  }
}
