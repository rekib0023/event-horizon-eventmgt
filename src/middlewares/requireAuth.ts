import { Request, Response, NextFunction } from "express";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const requireAuth = (
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
    req.currentUser = {
      id: userID,
      email: userEmail,
    } as UserPayload;
    next();
  } catch (err) {
    res.status(401).send({ error: "Not authorized" });
  }
};
