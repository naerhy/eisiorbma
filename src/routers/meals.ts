import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { authMiddleware, validateID } from "../middlewares";
import sharp from "sharp";
import { unlink } from "fs";
import { addMealBodySchema, updateMealBodySchema, updatePhotoBodySchema } from "../validation";

import type { Router } from "express";
import { HTTPError, type ReqWithParamID } from "../shared";
import type { Env } from "../validation";

interface FileInfo {
  filename: string;
  paths: {
    photo: string;
    thumbnail: string;
  };
}

async function createMealsRouter(env: Env): Promise<Router> {
  const urls = {
    vps: "static/ambroisie", // TODO: store in .env [?]
    photos: `${env.DIR}/photos`,
    thumbnails: `${env.DIR}/thumbnails`
  };
  const dataSource = new DataSource({
    type: "postgres",
    host: env.NODE_ENV === "development" ? "localhost" : "db",
    port: 5432,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    entities: [MealEntity],
    synchronize: true // TODO: learn migrations and remove this line
  });
  await dataSource.initialize();
  const repository = dataSource.getRepository(MealEntity);
  const router = express.Router();

  router.get("/", async (_, res, next) => {
    try {
      res.json((await repository.find()).map((meal) => deserializeMealRecipe(meal)));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      res.json(deserializeMealRecipe(await findMeal(Number(req.params.id))));
    } catch (err) {
      next(err);
    }
  });

  router.use(authMiddleware(env.JWT_SECRET));

  router.post("/", async (req, res, next) => {
    let fileInfo: FileInfo | null = null;
    try {
      const body = addMealBodySchema.parse(req.body);
      fileInfo = await createLocalFiles(body.photoBase64);
      const meal = new MealEntity();
      meal.name = body.name;
      meal.types = [...body.types];
      meal.difficulty = body.difficulty;
      meal.cookingTime = body.cookingTime;
      meal.vegetarian = body.vegetarian;
      meal.recipe = body.recipe ? JSON.stringify(body.recipe) : null;
      meal.filename = fileInfo.filename;
      meal.photoURL = `${urls.vps}/photos/${fileInfo.filename}`;
      meal.thumbnailURL = `${urls.vps}/thumbnails/${fileInfo.filename}`;
      res.json(deserializeMealRecipe(await repository.save(meal)));
    } catch (err) {
      if (fileInfo) {
        deleteLocalFiles([fileInfo.paths.photo, fileInfo.paths.thumbnail]);
      }
      next(err);
    }
  });

  router.patch("/:id", async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await findMeal(Number(req.params.id));
      const body = updateMealBodySchema.parse(req.body);
      meal.name = body.name;
      meal.types = [...body.types];
      meal.difficulty = body.difficulty;
      meal.cookingTime = body.cookingTime;
      meal.vegetarian = body.vegetarian;
      meal.recipe = body.recipe ? JSON.stringify(body.recipe) : null;
      res.json(deserializeMealRecipe(await repository.save(meal)));
    } catch (err) {
      next(err);
    }
  });

  router.patch("/photo/:id", async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await findMeal(Number(req.params.id));
      const { photoBase64 } = updatePhotoBodySchema.parse(req.body);
      const fileInfo = await createLocalFiles(photoBase64);
      const oldFilepaths = [
        `${urls.photos}/${meal.filename}`,
        `${urls.thumbnails}/${meal.filename}`
      ];
      meal.filename = fileInfo.filename;
      meal.photoURL = `${urls.vps}/photos/${fileInfo.filename}`;
      meal.thumbnailURL = `${urls.vps}/thumbnails/${fileInfo.filename}`;
      res.json(deserializeMealRecipe(await repository.save(meal)));
      deleteLocalFiles(oldFilepaths);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    try {
      const meal = await findMeal(Number(req.params.id));
      const oldFilepaths = [
        `${urls.photos}/${meal.filename}`,
        `${urls.thumbnails}/${meal.filename}`
      ];
      await repository.remove(meal);
      res.json(deserializeMealRecipe(meal));
      deleteLocalFiles(oldFilepaths);
    } catch (err) {
      next(err);
    }
  });

  function deserializeMealRecipe(meal: MealEntity) {
    if (meal.recipe) {
      return { ...meal, recipe: JSON.parse(meal.recipe) };
    }
    return meal;
  }

  async function findMeal(id: number): Promise<MealEntity> {
    const meal = await repository.findOneBy({ id });
    if (!meal) {
      throw new HTTPError(404, "Le repas demandé n'existe pas");
    }
    return meal;
  }

  async function createLocalFiles(photoBase64: string): Promise<FileInfo> {
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    const filename = (Math.random() + 1).toString(36).substring(7) + ".jpeg";
    // TODO: check if file exists, generate again filename if so
    const paths = {
      photo: `${urls.photos}/${filename}`,
      thumbnail: `${urls.thumbnails}/${filename}`
    };
    const sharpInstance = sharp(
      Buffer.from(photoBase64.replace("data:image/jpeg;base64,", ""), "base64")
    );
    await Promise.all([
      sharpInstance.clone().jpeg().toFile(paths.photo),
      // TODO: resize only if photo is greater than limits
      sharpInstance.clone().resize(500, 500, { fit: sharp.fit.outside }).toFile(paths.thumbnail)
    ]);
    return { filename, paths };
  }

  function deleteLocalFiles(filepaths: string[]): void {
    for (const fp of filepaths) {
      unlink(fp, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  }

  return router;
}

export default createMealsRouter;
