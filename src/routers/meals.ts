import express from "express";
import { DataSource } from "typeorm";
import { MealEntity } from "../entities/meal";
import { authMiddleware, validateID } from "../middlewares";
import { validateAddMealBodySchema, validateUpdateMealBodySchema } from "../validation";
import sharp from "sharp";
import { unlinkSync } from "node:fs";
import { join } from "node:path";

import type { Router } from "express";
import type { ReqWithParamID } from "../types";
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
    vps: "https://naerhy.ovh/static/ambroisie", // TODO: store in .env [?]
    photos: join(env.DIR, "photos"),
    thumbnails: join(env.DIR, "thumbnails")
  };
  const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
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

  router.use(authMiddleware(env.JWT_SECRET));

  router.post("/", async (req, res, next) => {
    let fileInfo: FileInfo | null = null;
    try {
      const body = validateAddMealBodySchema(req.body) ? req.body : null;
      if (!body) {
        throw new Error("Body is invalid");
      }
      fileInfo = await createLocalFiles(body.photoBase64);
      const meal = new MealEntity();
      meal.name = body.name;
      meal.filename = fileInfo.filename;
      meal.isRecipe = body.isRecipe;
      meal.photoURL = join(urls.vps, "photos", fileInfo.filename);
      meal.thumbnailURL = join(urls.vps, "thumbnails", fileInfo.filename);
      res.json(await repository.save(meal));
    } catch (err: unknown) {
      try {
        if (fileInfo) {
          deleteLocalFiles([fileInfo.paths.photo, fileInfo.paths.thumbnail]);
        }
      } catch (err: unknown) {
        console.error(err);
      }
      next(err);
    }
  });

  router.patch("/:id", validateID, async (req: ReqWithParamID, res, next) => {
    let fileInfo: FileInfo | null = null;
    try {
      const meal = await findMeal(Number(req.params.id));
      const body = validateUpdateMealBodySchema(req.body) ? req.body : null;
      if (!body) {
        throw new Error("Body is invalid");
      }
      if (body.photoBase64) {
        fileInfo = await createLocalFiles(body.photoBase64);
        meal.filename = fileInfo.filename;
        meal.photoURL = join(urls.vps, "photos", fileInfo.filename);
        meal.thumbnailURL = join(urls.vps, "thumbnails", fileInfo.filename);
      }
      repository.merge(meal, body);
      res.json(await repository.save(meal));
      // TODO: delete old files
    } catch (err: unknown) {
      next(err);
    }
  });

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

  async function createLocalFiles(photoBase64: string): Promise<FileInfo> {
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    const filename = (Math.random() + 1).toString(36).substring(7) + ".jpeg";
    // TODO: check if file exists, generate again filename if so
    const paths = {
      photo: join(urls.photos, filename),
      thumbnail: join(urls.thumbnails, filename)
    };
    const sharpInstance = sharp(
      Buffer.from(photoBase64.replace("data:image/jpeg;base64,", ""), "base64")
    );
    await Promise.all([
      sharpInstance.clone().jpeg().toFile(paths.photo),
      // TODO: resize only if photo is greater than limits
      sharpInstance
        .clone()
        .resize(500, 500, { fit: sharp.fit.outside })
        .toFile(paths.thumbnail)
    ]);
    return { filename, paths };
  }

  function deleteLocalFiles(filepaths: string[]): void {
    for (const fp of filepaths) {
      unlinkSync(fp);
    }
  }

  return router;
}

export default createMealsRouter;
