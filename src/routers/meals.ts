import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { validateID } from "../middlewares";
import { validateAddMealBodySchema } from "../validation";

import type { Request, Router } from "express";
import type { AddMealBody } from "../validation";
import type { ReqWithParamID } from "../types";

async function createMealsRouter(): Promise<Router> {
  const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user",
    password: "password",
    database: "eisiorbma",
    entities: [MealEntity],
    synchronize: true // TODO: learn migrations and remove this line
  });
  await dataSource.initialize();
  const repository = dataSource.getRepository(MealEntity);
  const router = express.Router();
  router.get("/", async (_, res, next) => {
    try {
      res.json(await repository.find());
    } catch (err: unknown) {
      console.error(err);
      next(err);
    }
  });
  router.get("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      res.json(await findMeal(Number(req.params.id)));
    } catch (err: unknown) {
      next(err);
    }
  });
  router.post("/", async (req: Request<{}, {}, AddMealBody>, res, next) => {
    try {
      const body = validateAddMealBodySchema(req.body) ? req.body : null;
      if (!body) {
        throw new Error("Body is invalid");
      }
      const meal = new MealEntity();
      meal.name = body.name;
      meal.isRecipe = body.isRecipe;
      meal.photoURL = "";
      meal.thumbnailURL = "";
      res.json(await repository.save(meal));
    } catch (err: unknown) {
      next(err);
    }
  });
  /*
  router.patch("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await findMeal(Number(req.params.id));
      // mealRepository.merge(meal, req.body);
      const newPhoto = new PhotoEntity();
      newPhoto.id = meal.photo.id;
      newPhoto.photoBase64 = req.body.photoBase64;
      await photoRepository.save(newPhoto);
      res.json(await mealRepository.save(meal));
      console.log(await photoRepository.find()); // TODO: remove
    } catch (err: unknown) {
      next(err);
    }
  });
  */
  router.delete("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await findMeal(Number(req.params.id));
      await repository.remove(meal);
      res.json(meal);
    } catch (err: unknown) {
      next(err);
    }
  });

  async function findMeal(id: number): Promise<MealEntity> {
    const meal = await repository.findOneBy({ id });
    if (!meal) {
      throw new Error("Meal does not exist");
    }
    return meal;
  }

  return router;
}

export default createMealsRouter;
