import "reflect-metadata";
import express from "express";
import cors from "cors";
import createMealsRouter from "./routers/meals";

async function start(): Promise<void> {
  const port = 3000; // TODO: load from .env
  const app = express();
  app.use(express.json());
  app.use(cors()); // TODO: check if needed (in production too) [?]
  app.use("/meals", await createMealsRouter());
  app.listen(port, () => {
    console.log(`Express application is running on http://localhost:${port}`);
  });
}

start();
