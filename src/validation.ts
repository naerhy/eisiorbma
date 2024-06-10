import Ajv from "ajv";
import { MealEntity } from "./entities/meal";

import type { JSONSchemaType } from "ajv";

interface Env {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}

type AddMealBody = Omit<MealEntity, "id" | "filename" | "photoURL" | "thumbnailURL"> & { photoBase64: string };

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
    isRecipe: { type: "boolean" },
    photoBase64: { type: "string", pattern: "^data:image\/jpeg;base64,.+$" }
  },
  required: ["name", "isRecipe", "photoBase64"],
  additionalProperties: false
};

const ajv = new Ajv({ coerceTypes: true });

export const validateEnvSchema = ajv.compile(envSchema);
export const validateAddMealBodySchema = ajv.compile(addMealBodySchema);
