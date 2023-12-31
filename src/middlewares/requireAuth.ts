import { User, UserDocument } from "@models/user.model";
import { NextFunction, Request, Response } from "express";
import { ServerError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserDocument;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];

  if (!userID || !userEmail) {
    return res.status(401).send({ error: "Missing required headers" });
  }

  try {
    const user = await User.findOne({ userId: userID, email: userEmail });

    if (!user) {
      throw new ServerError("User not found", 404);
    }

    req.currentUser = user;
    next();
  } catch (err) {
    console.log(err);
    if (err instanceof ServerError) {
      return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }
    return res.status(401).send({ error: "Not authorized" });
  }
};
