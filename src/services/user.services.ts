import { User, UserAttributes } from "@models/user.model";

async function createUser(userAttributes: UserAttributes) {
  try {
    const user = new User({
      userId: userAttributes.userId,
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
