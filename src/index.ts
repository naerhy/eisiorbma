import "reflect-metadata";
import express from "express";
import cors from "cors";
import createMealsRouter from "./routers/meals";
import { validateEnvSchema } from "./validation";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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
  const staticDir = "static";
  createStaticDir(staticDir);
  const env = validateEnvSchema(process.env) ? process.env : null;
  if (env) {
    const app = express();
    app.use(express.json({ limit: "1mb" }));
    app.use(cors()); // TODO: check if needed (in production too) [?]
    app.use("/meals", await createMealsRouter(staticDir));
    app.listen(process.env.PORT, () => {
      console.log(`Express application is running on http://localhost:${process.env.PORT}`);
    });
  } else {
    console.error("Environment variables are not defined, or invalid, exiting...");
  }
}

start();
