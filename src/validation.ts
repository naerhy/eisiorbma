import Ajv from "ajv";
import { MealEntity } from "./entities/meal";

import type { JSONSchemaType } from "ajv";
import { RecipeEntity } from "./entities/recipe";

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

interface AddMealBody {
  meal: Pick<MealEntity, "name"> & {
    photoBase64: string;
  };
  recipe?: Omit<RecipeEntity, "id">;
}

/*
type UpdateMealBody = Omit<AddMealBody, "meal"> & {
  meal: Omit<AddMealBody["meal"], "photoBase64">;
};
*/

// type UpdateMealBody = Omit<AddMealBody, "meal.photoBase64">;

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
    meal: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        photoBase64: { type: "string", pattern: "^data:image\/jpeg;base64,.+$" }
      },
      required: ["name", "photoBase64"],
      additionalProperties: false
    },
    recipe: {
      type: "object",
      nullable: true,
      properties: {
        types: { type: "array", items: { type: "integer" }, uniqueItems: true },
        difficulty: { type: "integer" },
        cookingTime: { type: "integer" },
        isVegetarian: { type: "boolean" },
        servings: { type: "integer" },
        ingredients: { type: "string" },
        directions: { type: "string" }
      },
      required: [
        "types",
        "difficulty",
        "cookingTime",
        "isVegetarian",
        "servings",
        "ingredients",
        "directions"
      ],
      additionalProperties: false
    }
  },
  required: ["meal"],
  additionalProperties: false
};

/*
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
*/

const ajv = new Ajv({ coerceTypes: true });

export const validateEnvSchema = ajv.compile(envSchema);
export const validateAuthBodySchema = ajv.compile(authBodySchema);
export const validateAddMealBodySchema = ajv.compile(addMealBodySchema);
// export const validateUpdateMealBodySchema = ajv.compile(updateMealBodySchema);
