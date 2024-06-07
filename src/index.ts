import "reflect-metadata";
import express from "express";
import cors from "cors";
import createMealsRouter from "./routers/meals";
import Ajv from "ajv";

import type { JSONSchemaType } from "ajv";

interface Env {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}

const envSchema: JSONSchemaType<Env> = {
  type: "object",
  properties: {
    PORT: { type: "integer" },
    POSTGRES_USER: { type: "string", minLength: 4 },
    POSTGRES_PASSWORD: { type: "string", minLength: 4 },
    POSTGRES_DB: { type: "string", minLength: 4 }
  },
  required: ["PORT", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"],
  additionalProperties: true
};

function validateEnv(): Env | null {
  const ajv = new Ajv({ coerceTypes: true });
  const validate = ajv.compile(envSchema);
  return validate(process.env) ? process.env : null;
}

async function start(): Promise<void> {
  const env = validateEnv();
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
