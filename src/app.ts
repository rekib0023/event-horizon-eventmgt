import { errorHandler } from "@middlewares/errorHandler";
import { eventRoutes } from "@routes/event.routes";
import express from "express";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(eventRoutes);

app.use(errorHandler);

export { app };
