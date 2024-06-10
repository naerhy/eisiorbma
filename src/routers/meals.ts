import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { validateID } from "../middlewares";
import { validateAddMealBodySchema } from "../validation";
import sharp from "sharp";
import { unlinkSync } from "node:fs";
import { join } from "node:path";

import type { Router } from "express";
import type { ReqWithParamID } from "../types";

async function createMealsRouter(dir: string): Promise<Router> {
  const urls = {
    vps: "https://naerhy.ovh/static/ambroisie", // TODO: store in .env [?]
    photos: join(dir, "photos"),
    thumbnails: join(dir, "thumbnails")
  };
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
  router.post("/", async (req, res, next) => {
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    const filename = (Math.random() + 1).toString(36).substring(7) + ".jpeg";
    // TODO: check if file exists, generate again filename if so
    const localPaths = {
      photo: join(urls.photos, filename),
      thumbnail: join(urls.thumbnails, filename)
    };
    try {
      const body = validateAddMealBodySchema(req.body) ? req.body : null;
      if (!body) {
        throw new Error("Body is invalid");
      }
      const sharpInstance = sharp(
        Buffer.from(body.photoBase64.replace("data:image/jpeg;base64,", ""), "base64")
      );
      await Promise.all([
        sharpInstance.clone().jpeg().toFile(localPaths.photo),
        // TODO: resize only if photo is greater than limits
        sharpInstance
          .clone()
          .resize(500, 500, { fit: sharp.fit.outside })
          .toFile(localPaths.thumbnail)
      ]);
      const meal = new MealEntity();
      meal.name = body.name;
      meal.filename = filename;
      meal.isRecipe = body.isRecipe;
      meal.photoURL = join(urls.vps, "photos", filename);
      meal.thumbnailURL = join(urls.vps, "thumbnails", filename);
      res.json(await repository.save(meal));
    } catch (err: unknown) {
      try {
        deleteLocalFiles([localPaths.photo, localPaths.thumbnail]);
      } catch (err: unknown) {
        console.error(err);
      }
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
      deleteLocalFiles([join(urls.photos, meal.filename), join(urls.thumbnails, meal.filename)]);
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

  function deleteLocalFiles(filepaths: string[]): void {
    for (const fp of filepaths) {
      unlinkSync(fp);
    }
  }

  return router;
}

export default createMealsRouter;
