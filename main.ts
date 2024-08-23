import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import mongoose from "npm:mongoose";
import { FRONTEND_URL, MONGODB_URI } from "./util/Environment.ts";
import logger from "./middleware/logger.ts";
import { SERVER_PORT } from "./util/Environment.ts";
import authRouter from "./controller/authController.ts";
import recipeRouter from "./controller/recipeController.ts";

const app = new Application();
const router = new Router();
app.use(logger);

app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', FRONTEND_URL); 
  ctx.response.headers.set('Access-Control-Allow-Credentials', 'true'); 
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Handle preflight requests (OPTIONS method)
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status = 204;
    return;
  }

  return next();
});
router.get("/", (ctx) => {
  ctx.response.body = "FlavorCraft API\n Version 1.0.0 \n created by JNunez";
});

async function connectMongoDb() {
  try {
    if(!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to connect to MongoDB");
  }
}

connectMongoDb();

app.use(router.routes());

// Routes
app.use(authRouter.routes());
app.use(recipeRouter.routes());
if(!SERVER_PORT){
  throw new Error("SERVER_PORT is not set");
}
console.log(`Server running on http://localhost:${+SERVER_PORT}`);
await app.listen({ port: +SERVER_PORT });
