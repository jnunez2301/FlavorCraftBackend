import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import mongoose from 'npm:mongoose';
import { FRONTEND_URL } from "./util/Enviroment.ts";
import { MONGODB_URI } from "./util/Enviroment.ts";
import logger from './middleware/logger.ts';
import { SERVER_PORT } from "./util/Enviroment.ts";
import authRouter from "./controller/authController.ts";

const app = new Application();
const router = new Router();

app.use(oakCors({
  origin: FRONTEND_URL,
  credentials: true
}));

async function connectMongoDb() {
  try {
    await mongoose.connect(MONGODB_URI)
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

console.log(`Server running on http://localhost:${SERVER_PORT}`);
await app.listen({ port: SERVER_PORT });