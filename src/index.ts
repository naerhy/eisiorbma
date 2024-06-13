import "reflect-metadata";
import express from "express";
import cors from "cors";
import createMealsRouter from "./routers/meals";
import { validateEnvSchema } from "./validation";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import createAuthRouter from "./routers/auth";

function createStaticDir(dir: string): void {
  if (!existsSync(dir)) {
    throw new Error(`Static directory ${dir} doesn't exist, create it manually`);
  }
  for (const d of ["photos", "thumbnails"]) {
    const path = join(dir, d);
    if (!existsSync(path)) {
      mkdirSync(path);
    }
  }
}

async function start(): Promise<void> {
  const env = validateEnvSchema(process.env) ? process.env : null;
  if (env) {
    createStaticDir(env.DIR);
    const app = express();
    app.use(express.json({ limit: "1mb" }));
    app.use(cors()); // TODO: check if needed (in production too) [?]
    app.use("/auth", createAuthRouter(env.JWT_SECRET, env.ADMIN_PW));
    app.use("/meals", await createMealsRouter(env));
    app.listen(env.PORT, () => {
      console.log(`Express application is running on http://localhost:${env.PORT}`);
    });
  } else {
    console.error("Environment variables are not defined, or invalid, exiting...");
  }
}

start();
