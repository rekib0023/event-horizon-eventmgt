import { UserController } from "@controllers/user.controller";
import { requireAuth } from "@middlewares/requireAuth";
import express from "express";

const router = express.Router();

const userController = new UserController();

router.get(
  "/users/:userId/events",
  requireAuth,
  userController.getUserEvents
);

export { router as userRoutes };
