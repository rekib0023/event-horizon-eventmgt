import { Document, Schema, model } from "mongoose";

interface EventAttributes {
  name: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  images: string[];
  createdBy: Schema.Types.ObjectId;
  attendees: Schema.Types.ObjectId[];
}

interface EventDocument extends Document, EventAttributes {}

const eventSchema = new Schema<EventDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    images: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = model<EventDocument>("Event", eventSchema);

export { Event, EventDocument };
