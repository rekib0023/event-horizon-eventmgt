import { UserDocument } from "@models/user.model";
import { createUser, deleteUser, updateUser } from "@services/user.services";
import { natsWrapper } from "@utils/natsWrapper";

export const initSubscribers = () => {
  natsWrapper.subscribe("user.created", (userAttributes: UserDocument) => {
    createUser(userAttributes);
  });

  natsWrapper.subscribe("user.updated", (userAttributes: UserDocument) => {
    updateUser(userAttributes);
  });

  natsWrapper.subscribe("user.deleted", (userAttributes: UserDocument) => {
    deleteUser(userAttributes);
  });
};
