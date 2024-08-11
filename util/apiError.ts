import { Context } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import ApiResponse from "../model/ApiResponse.ts";
import { Status } from "https://deno.land/x/oak@v16.1.0/deps.ts";

// deno-lint-ignore no-explicit-any
export function apiError(ctx: Context, error: any) {
  console.error(error);
  ctx.response.status = Status.InternalServerError;
  ctx.response.body = {
    success: false,
    message: error.toString(),
  } as ApiResponse;
  return ctx;
}