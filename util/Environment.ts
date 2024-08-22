
export const SERVER_PORT = Deno.env.get("SERVER_PORT");
export const MONGODB_URI = Deno.env.get("MONGODB_URI");
export const FRONTEND_URL = Deno.env.get("FRONTEND_URL");
export const JWT_SECRET = new TextEncoder().encode(Deno.env.get("JWT_SECRET"));
export const ENCRYPT_SECRET = Deno.env.get("ENCRYPT_SECRET");
export const ENVIRONMENT = Deno.env.get("ENVIRONMENT"); // PRODUCTION || any other value
export const AWS_ACCESS_KEY = Deno.env.get("AWS_ACCESS_KEY");
export const AWS_SECRET_KEY = Deno.env.get("AWS_SECRET_KEY");
export const AWS_REGION = Deno.env.get("AWS_REGION");
export const AWS_BUCKET = Deno.env.get("AWS_BUCKET");
export const AWS_CLOUDFRONT_URL = Deno.env.get("AWS_CLOUDFRONT_URL");
export const AWS_CLOUDFRONT_DISTRIBUTION_ID = Deno.env.get("AWS_CLOUDFRONT_DISTRIBUTION_ID");