import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.union([z.literal("development"), z.literal("production")]),
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
  name: z.string().min(1).max(64),
  types: z
    .array(z.number().int().nonnegative().lt(4))
    .nonempty()
    .transform((arr) => new Set(arr)),
  difficulty: z.number().int().nonnegative().lt(3),
  cookingTime: z.number().int().nonnegative().lt(4),
  isVegetarian: z.boolean(),
  photoBase64: z.string().regex(/^data:image\/jpeg;base64,.+$/)
});

const recipeSchema = z.object({
  servings: z.number().int().nonnegative(),
  ingredients: z.string(),
  directions: z.string()
});

export const addMealBodySchema = z.object({
  meal: mealSchema,
  recipe: recipeSchema.nullable()
});

export const updateMealBodySchema = addMealBodySchema.extend({
  meal: mealSchema.omit({ photoBase64: true })
});

export const updatePhotoSchema = mealSchema.pick({ photoBase64: true });
