import { jwtVerify } from "https://deno.land/x/jose@v5.6.3/jwt/verify.ts";
import { Context } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { ENCRYPT_SECRET, JWT_SECRET } from "../util/Enviroment.ts";
import { Status } from "jsr:@oak/commons@0.11/status";
import { aes_gcm_decrypt } from "https://deno.land/x/crypto_aes_gcm@2.0.3/index.js";
import ApiResponse, { ResponseTypes } from "../model/ApiResponse.ts";

async function jwtMiddleware(ctx: Context, next: () => Promise<unknown>) {
  const authHeader = await ctx.cookies.get("jwt_token");
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decrypted = await aes_gcm_decrypt(token, ENCRYPT_SECRET);
        const { payload } = await jwtVerify(decrypted, JWT_SECRET);
        ctx.state.user = payload;
        await next();
      } catch (err) {
        ctx.response.status = Status.Unauthorized;
        ctx.response.body = {
          success: false,
          message: err.message || ResponseTypes.INVALID_TOKEN,
        } as ApiResponse;
        return;
      }
    } else {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = {
        success: false,
        message: ResponseTypes.TOKEN_NOT_PROVIDED,
      } as ApiResponse;
      return;
    }
  } else {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = {
      success: false,
      message: ResponseTypes.TOKEN_NOT_PROVIDED,
    } as ApiResponse;
    return;
  }
}

export default jwtMiddleware;