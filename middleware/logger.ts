import { Context, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const logger = async (ctx: Context, next: Next) => {
  // Log the request method and URL
  const currentDate = new Date();
  const apiLog = `${currentDate.getUTCHours()}:${currentDate.getUTCMinutes()} - ${ctx.request.method} ${ctx.request.url.pathname}`;
  console.log();

  // Call the next middleware
  await next();

  // Log the response status
  console.log(apiLog, ctx.response.status);
};

export default logger;