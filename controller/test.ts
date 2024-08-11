import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import jwtMiddleware from "../middleware/jwtMiddleware.ts";
import { apiError } from "../util/apiError.ts";

const testRouter = new Router();

testRouter.get("/protected", jwtMiddleware, async (ctx, next) => {
  try {
    ctx.response.body = "Protected API";
  } catch (error) {
    apiError(ctx, error);
  }
  await next();
});
testRouter.get("/test", async (ctx, next) => {
  ctx.response.body = "Test API";
  await next();
});

export default testRouter;
