import { User, UserDocument } from "@models/user.model";

async function createUser(userAttributes: UserDocument) {
  try {
    console.log("Creating user:", userAttributes)
    const user = new User({
      userId: userAttributes.id,
      firstName: userAttributes.firstName,
      lastName: userAttributes.lastName,
      userName: userAttributes.userName,
      email: userAttributes.email,
    });

    await user.save();
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

export { createUser };
