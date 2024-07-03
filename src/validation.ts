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

const recipeSchema = z.object({
  servings: z.number().int().nonnegative(),
  ingredients: z.string(),
  directions: z.string()
});

export const addMealBodySchema = z.object({
  name: z.string().min(1).max(64),
  types: z
    .array(z.number().int().nonnegative().lt(4))
    .nonempty()
    .transform((arr) => new Set(arr)),
  difficulty: z.number().int().nonnegative().lt(3),
  cookingTime: z.number().int().nonnegative().lt(4),
  vegetarian: z.boolean(),
  recipe: recipeSchema.nullable(),
  photoBase64: z.string().regex(/^data:image\/jpeg;base64,.+$/)
});

export const updateMealBodySchema = addMealBodySchema.omit({ photoBase64: true });

export const updatePhotoBodySchema = addMealBodySchema.pick({ photoBase64: true });
