import Ajv from "ajv";
import { MealEntity } from "./entities/meal";

import type { JSONSchemaType } from "ajv";

interface Env {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}

export type AddMealBody = Omit<MealEntity, "id" | "photoURL" | "thumbnailURL">;

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

const addMealBodySchema: JSONSchemaType<AddMealBody> = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    isRecipe: { type: "boolean" }
  },
  required: ["name", "isRecipe"],
  additionalProperties: false
};

const ajv = new Ajv({ coerceTypes: true });

export const validateEnvSchema = ajv.compile(envSchema);
export const validateAddMealBodySchema = ajv.compile(addMealBodySchema);
