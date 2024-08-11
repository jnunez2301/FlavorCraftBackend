import { MinifiedUser, User } from "../model/User.ts";

function minifyUser(user: User) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
  } as MinifiedUser;
}

export default minifyUser;