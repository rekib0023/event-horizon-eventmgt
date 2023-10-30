import { User, UserDocument } from "@models/user.model";

async function createUser(userAttributes: UserDocument) {
  try {
    const user = new User({
      userId: userAttributes.id,
      firstName: userAttributes.firstName,
      lastName: userAttributes.lastName,
      userName: userAttributes.userName,
      email: userAttributes.email,
    });

    await user.save();

    console.log("User created successfully:", user);
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

export { createUser };
