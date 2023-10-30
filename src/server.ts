import { UserDocument } from "@models/user.model";
import { createUser } from "@services/user.services";
import { natsWrapper } from "@utils/natsWrapper";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { app } from "./app";
configDotenv();

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await natsWrapper.connect(process.env.NATS_SERVER!);

    natsWrapper.subscribe("user.created", (userAttributes: UserDocument) => {
      createUser(userAttributes);
    });
  } catch (err) {
    console.error("Error connecting to NATS", err);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
  }
};

start();
