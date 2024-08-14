import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

export const SERVER_PORT = +env["SERVER_PORT"] || 8080;
export const MONGODB_URI = env["MONGODB_URI"];
export const FRONTEND_URL = env["FRONTEND_URL"];
export const JWT_SECRET = new TextEncoder().encode(env["JWT_SECRET"]);
export const ENCRYPT_SECRET = env["ENCRYPT_SECRET"];
export const ENVIROMENT = env["ENVIROMENT"]; // PRODUCTION || any other value