import Ajv from "ajv";
import { MealEntity } from "./entities/meal";
import { PhotoEntity } from "./entities/photo";

import type { JSONSchemaType } from "ajv";

interface Env {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}

export type NewMealBody = Omit<MealEntity, "id" | "thumbnailBase64" | "photo"> & Omit<PhotoEntity, "id">;

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

const newMealBodySchema: JSONSchemaType<NewMealBody> = {
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
export const validateNewMealBodySchema = ajv.compile(newMealBodySchema);
