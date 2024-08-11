import mongoose from "npm:mongoose"

export type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  role: "USER";
}
export type MinifiedUser = {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
}

const userSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  role: { type: String, default: "USER" }
}, { timestamps: true });

const userModel = mongoose.model<User>("User", userSchema);
export default userModel;