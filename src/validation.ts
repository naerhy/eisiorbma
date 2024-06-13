import Ajv from "ajv";
import { MealEntity } from "./entities/meal";

import type { JSONSchemaType } from "ajv";

export interface Env {
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  JWT_SECRET: string;
  ADMIN_PW: string;
  DIR: string;
}

interface AuthBody {
  password: string;
}

type AddMealBody = Omit<MealEntity, "id" | "filename" | "photoURL" | "thumbnailURL"> & {
  photoBase64: string;
};

type UpdateMealBody = Partial<AddMealBody>;

const envSchema: JSONSchemaType<Env> = {
  type: "object",
  properties: {
    PORT: { type: "integer" },
    POSTGRES_USER: { type: "string", minLength: 4 },
    POSTGRES_PASSWORD: { type: "string", minLength: 4 },
    POSTGRES_DB: { type: "string", minLength: 4 },
    JWT_SECRET: { type: "string", minLength: 6 },
    ADMIN_PW: { type: "string", minLength: 8 },
    DIR: { type: "string", minLength: 1 }
  },
  required: [
    "PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
    "JWT_SECRET",
    "ADMIN_PW",
    "DIR"
  ],
  additionalProperties: true
};

const authBodySchema: JSONSchemaType<AuthBody> = {
  type: "object",
  properties: {
    password: { type: "string" }
  },
  required: ["password"],
  additionalProperties: false
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

const updateMealBodySchema: JSONSchemaType<UpdateMealBody> = {
  type: "object",
  properties: {
    name: { type: "string", nullable: true, minLength: 1 },
    isRecipe: { type: "boolean", nullable: true  },
    photoBase64: { type: "string", nullable: true, pattern: "^data:image\/jpeg;base64,.+$" }
  },
  required: [],
  additionalProperties: false
};

const ajv = new Ajv({ coerceTypes: true });

export const validateEnvSchema = ajv.compile(envSchema);
export const validateAuthBodySchema = ajv.compile(authBodySchema);
export const validateAddMealBodySchema = ajv.compile(addMealBodySchema);
export const validateUpdateMealBodySchema = ajv.compile(updateMealBodySchema);
