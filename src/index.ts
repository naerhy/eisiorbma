import "reflect-metadata";
import express from "express";
import cors from "cors";
import createMealsRouter from "./routers/meals";
import { validateEnvSchema } from "./validation";

async function start(): Promise<void> {
  const env = validateEnvSchema(process.env) ? process.env : null;
  if (env) {
    const app = express();
    app.use(express.json());
    app.use(cors()); // TODO: check if needed (in production too) [?]
    app.use("/meals", await createMealsRouter());
    app.listen(process.env.PORT, () => {
      console.log(`Express application is running on http://localhost:${process.env.PORT}`);
    });
  } else {
    console.error("Environment variables are not defined, or invalid, exiting...");
  }
}

start();
