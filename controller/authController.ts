import { Context, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import userModel, { User } from "../model/User.ts";
import { Status } from "jsr:@oak/commons@0.11/status";
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { SignJWT } from "https://deno.land/x/jose@v5.6.3/index.ts";
import { ENCRYPT_SECRET, ENVIROMENT, JWT_SECRET } from "../util/Enviroment.ts";
import authMiddleware from "../middleware/jwtMiddleware.ts";
import { aes_gcm_encrypt } from 'https://deno.land/x/crypto_aes_gcm@2.0.3/index.js';
import ApiResponse from "../model/ApiResponse.ts";
import { ResponseTypes } from "../model/ApiResponse.ts";
import { apiError } from "../util/apiError.ts";
import minifyUser from "../util/minifyUser.ts";


const authRouter = new Router();

authRouter.post("/api/auth/login", async (ctx: Context) => {
  try {
    const { nickname, password } = await ctx.request.body.json();   
    const user: User | null = await userModel.findOne({$or: [{email: nickname}, {username: nickname}]});
    if (!user) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = {
        success: false,
        message: ResponseTypes.WRONG_CREDENTIALS,
      } as ApiResponse;
      return;
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = {
        success: false,
        message: ResponseTypes.WRONG_CREDENTIALS,
      } as ApiResponse;
      return;
    }
    const jwtToken = await new SignJWT({ email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(JWT_SECRET);

    const encrypted = await aes_gcm_encrypt(jwtToken, ENCRYPT_SECRET);

    ctx.response.status = Status.OK;
    ctx.cookies.set("jwt_token", `Bearer ${encrypted}`, {
      httpOnly: true,
      sameSite: "strict",
      secure: ENVIROMENT === "PRODUCTION",
      maxAge: 7200,
    });
    
    ctx.response.body = {
      success: true,
      message: ResponseTypes.USER_LOGGED_IN,
      session: minifyUser(user),
    } as ApiResponse;
  } catch (err) {
    apiError(ctx, err);
  }
});

authRouter.post("/api/auth/register", async (ctx: Context) => {
  try {
    const body = await ctx.request.body.json();
    const userBody: User = await body;
    const user = await userModel.findOne({ email: userBody.email });
    if (user) {
      ctx.response.status = Status.Conflict;
      ctx.response.body = {
        success: false,
        message: ResponseTypes.USER_EXISTS,
      } as ApiResponse;
      return;
    } else {
      userBody.password = await hash(userBody.password);
      await userModel.create(userBody);
      ctx.response.status = Status.OK;
      ctx.response.body = {
        success: true,
        message: "Registrado correctamente " + userBody.email,
      } as ApiResponse;
    }
  } catch (err) {
    if(err.toString().split(" ")[1].trim() === "E11000") {
      ctx.response.status = Status.Conflict;
      ctx.response.body = {
        success: false,
        message: ResponseTypes.USER_EXISTS,
      } as ApiResponse;
      return err;
    }
    apiError(ctx, err);
  }
});

authRouter.get("/api/auth/profile", authMiddleware, async(ctx, next) => {
  try {
    const { email } = await ctx.state.user;
    const currentUser: User | null = await userModel.findOne({email: email})
    if(!currentUser) return;
    ctx.response.status = Status.OK;
    ctx.response.body = {
      success: true,
      message: "Autorizado",
      session: minifyUser(currentUser),
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  next();
});
authRouter.get("/api/auth/logout", authMiddleware, async (ctx, next) => {
  try {
    ctx.cookies.delete("jwt_token");
    ctx.response.status = Status.OK;
    ctx.response.body = {
      success: true,
      message: ResponseTypes.USER_LOGGED_OUT,
    } as ApiResponse;
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
});

export default authRouter;