import { Document, Schema, model } from "mongoose";

interface UserAttributes {
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  events: Schema.Types.ObjectId[];
}

interface UserDocument extends Document, UserAttributes {}

const userSchema = new Schema<UserDocument>(
  {
    userId: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model<UserDocument>("User", userSchema);

export { User, UserAttributes, UserDocument };
