import { Document, Schema, model } from "mongoose";

enum EventStatus {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

interface EventAttributes {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  time: string;
  images: string[];
  createdBy: Schema.Types.ObjectId;
  attendees: Schema.Types.ObjectId[];
  categories: string[];
  status: string;
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
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
    categories: [String],
    status: {
      type: String,
      required: true,
      enum: Object.values(EventStatus),
      default: EventStatus.UPCOMING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Event = model<EventDocument>("Event", eventSchema);

export { Event, EventAttributes, EventStatus };
