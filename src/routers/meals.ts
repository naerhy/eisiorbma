import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { PhotoEntity } from "../entities/photo";
import { validateID } from "../middlewares";
import { validateNewMealBodySchema } from "../validation";

import type { Request, Router } from "express";
import type { NewMealBody } from "../validation";
import type { ReqWithParamID } from "../types";

async function createMealsRouter(): Promise<Router> {
  const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user",
    password: "password",
    database: "eisiorbma",
    entities: [MealEntity, PhotoEntity],
    synchronize: true // TODO: learn migrations and remove this line
  });
  await dataSource.initialize();
  const mealRepository = dataSource.getRepository(MealEntity);
  const photoRepository = dataSource.getRepository(PhotoEntity);
  const router = express.Router();
  router.get("/", async (_, res, next) => {
    console.log(_.params);
    try {
      const meals = await mealRepository.find();
      res.json(meals);
    } catch (err: unknown) {
      console.error(err);
      next(err);
    }
  });
  router.get("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await mealRepository.findOne({
        where: {
          id: Number(req.params.id)
        },
        relations: {
          photo: true
        }
      });
      if (!meal) {
        throw new Error("Meal does not exist");
      }
      res.json(meal);
    } catch (err: unknown) {
      next(err);
    }
  });
  router.post("/", async (req: Request<{}, {}, NewMealBody>, res, next) => {
    try {
      const body = validateNewMealBodySchema(req.body) ? req.body : null;
      if (!body) {
        throw new Error("Body is invalid");
      }
      const newPhoto = new PhotoEntity();
      newPhoto.photoBase64 = body.photoBase64;
      await photoRepository.save(newPhoto);
      const newMeal = new MealEntity();
      newMeal.name = body.name;
      newMeal.isRecipe = body.isRecipe;
      newMeal.thumbnailBase64 = body.photoBase64; // TODO: create thumbnail of photo
      newMeal.photo = newPhoto;
      await mealRepository.save(newMeal);
      res.json(newMeal);
    } catch (err: unknown) {
      next(err);
    }
  });
  router.delete("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await mealRepository.findOneBy({ id: Number(req.params.id) });
      if (!meal) {
        throw new Error("Meal does not exist");
      }
      await mealRepository.remove(meal);
      res.json(meal);
    } catch (err: unknown) {
      next(err);
    }
  });
  return router;
}

export default createMealsRouter;
