import { Recipe } from "./Recipe.ts";
import { User } from "./User.ts";

export enum ResponseTypes {
  SUCCESS = "Your request was successful",
  ERROR = "There was an error with the server",
  UNATUHORIZED = "You are not authorizerd to access this resource",
  INVALID_TOKEN= "The token provided is invalid",
  TOKEN_NOT_PROVIDED = "No token provided",
  WRONG_CREDENTIALS = "The credentials provided are incorrect",
  NOT_AUTHORIZED = "You are not authorized to access this resource",
  USER_EXISTS = "The user or email already exists",
  USER_NOT_FOUND = "The user was not found",
  USER_DOES_NOT_EXIST = "The user does not exist",
  USER_CREATED = "You have registered successfully",
  USER_LOGGED_IN = "You have successfully logged in",
  USER_LOGGED_OUT = "You have successfully logged out",
}
type ApiResponse = {
  message: ResponseTypes | string | Recipe[] | Recipe | null,
  success: boolean
  session?: User
}

export default ApiResponse;