import express from "express";
import morgan from "morgan";
import { errorHandler } from "@middlewares/errorHandler";

const app = express();
app.use(express.json());

app.use(morgan("common"));

app.use(errorHandler);

export { app };
