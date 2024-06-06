import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { PhotoEntity } from "../entities/photo";

import type { Router } from "express";

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
  router.get("/", async (_, res) => {
    try {
      const meals = await mealRepository.find({ relations: { photo: true } });
      res.json(meals);
    } catch (err: unknown) {
      console.error(err);
    }
  });
  router.post("/", async (_, res) => {
    try {
      const newPhoto = new PhotoEntity();
      newPhoto.photoBase64 = "photo";
      await photoRepository.save(newPhoto);
      const newMeal = new MealEntity();
      newMeal.name = "test";
      newMeal.isRecipe = false;
      newMeal.thumbnailBase64 = "thumbnail";
      newMeal.photo = newPhoto;
      await mealRepository.save(newMeal);
      res.json(newMeal);
    } catch (err: unknown) {
      console.error(err);
    }
  });
  return router;
}

export default createMealsRouter;
