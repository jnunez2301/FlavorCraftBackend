import { Context } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import ApiResponse, { ResponseTypes } from "../model/ApiResponse.ts";
import { Status } from "https://deno.land/x/oak@v16.1.0/deps.ts";
import userModel, { User } from "../model/User.ts";

export async function verifyUserIntegrity(ctx: Context, currentUserId: string): Promise<boolean> {
  const { email } = await ctx.state.user;
  
  if (!email) {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = {
      success: false,
      message: ResponseTypes.NOT_AUTHORIZED,
    } as ApiResponse;
    return false;
  }

  const currentUser = await userModel.findOne({ _id: currentUserId }) as User;
  
  if (!currentUser) {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = {
      success: false,
      message: ResponseTypes.USER_DOES_NOT_EXIST,
    } as ApiResponse;
    return false;
  }
  if (currentUser.email !== email) {
    ctx.response.status = Status.Forbidden;
    ctx.response.body = {
      success: false,
      message: ResponseTypes.NOT_AUTHORIZED,
    } as ApiResponse;
    return false;
  }
  
  return true;
}

export default verifyUserIntegrity;