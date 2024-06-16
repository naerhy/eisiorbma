import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int(),
  POSTGRES_USER: z.string().min(4),
  POSTGRES_PASSWORD: z.string().min(4),
  POSTGRES_DB: z.string().min(4),
  JWT_SECRET: z.string().min(6),
  ADMIN_PW: z.string().min(8),
  DIR: z.string().min(1)
});
export type Env = z.infer<typeof envSchema>;

export const authBodySchema = z.object({ password: z.string() });

const mealSchema = z.object({
  name: z.string().min(1),
  photoBase64: z.string().regex(/^data:image\/jpeg;base64,.+$/)
});

const recipeSchema = z.object({
  types: z.array(z.number()),
  difficulty: z.number(),
  cookingTime: z.number(),
  isVegetarian: z.boolean(),
  servings: z.number(),
  ingredients: z.string(),
  directions: z.string()
});

export const addMealBodySchema = z.object({
  meal: mealSchema,
  recipe: recipeSchema.nullable()
});

export const updateMealBodySchema = addMealBodySchema.extend({
  meal: mealSchema.pick({ name: true })
});

export const updatePhotoSchema = mealSchema.pick({ photoBase64: true });
