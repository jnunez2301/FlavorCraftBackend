import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import mongoose from "npm:mongoose";
import { MONGODB_URI } from "./util/Environment.ts";
import logger from "./middleware/logger.ts";
import { SERVER_PORT } from "./util/Environment.ts";
import authRouter from "./controller/authController.ts";
import recipeRouter from "./controller/recipeController.ts";

const app = new Application();
const router = new Router();

app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', 'https://flavorcraft.jnunez.buzz'); // Set the specific origin
  ctx.response.headers.set('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow necessary headers
  ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow necessary methods
  
  // Handle preflight requests (OPTIONS method)
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status = 204;
    return;
  }

  return next();
});
// '/' should render dist/index.html
router.get("/",(ctx) => {
  ctx.response.body = "DENO PLSSSSSS";
})
async function connectMongoDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to connect to MongoDB");
  }
}

connectMongoDb();

app.use(router.routes());
app.use(logger);

// Routes
app.use(authRouter.routes());
app.use(recipeRouter.routes());

console.log(`Server running on http://localhost:${SERVER_PORT}`);
await app.listen({ port: SERVER_PORT });
