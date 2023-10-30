import { User, UserDocument } from "@models/user.model";

async function createUser(userAttributes: UserDocument) {
  try {
    console.log("Creating user:", userAttributes);
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

async function updateUser(userAttributes: UserDocument) {
  try {
    console.log("Updating user:", userAttributes);
    const filter = { userId: userAttributes.id };
    const update = {
      firstName: userAttributes.firstName,
      lastName: userAttributes.lastName,
      userName: userAttributes.userName,
      email: userAttributes.email,
    };

    User.updateOne(filter, update)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

async function deleteUser(userAttributes: UserDocument) {
  try {
    console.log("Updating user:", userAttributes);
    User.findOneAndDelete({ userId: userAttributes.id });
  } catch (err) {
    console.error("Error creating user:", err);
  }
}

export { createUser, updateUser, deleteUser };
