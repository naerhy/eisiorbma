import jwt from "jsonwebtoken";
import { HTTPError } from "./shared";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

import type { NextFunction, Request, Response } from "express";
import type { ReqWithParamID } from "./shared";

// TODO: add id to req object
export function validateID(req: ReqWithParamID, _: Response, next: NextFunction): void {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    next(new HTTPError(400, "L'id n'est pas valide"));
  } else {
    next();
  }
}

export function authMiddleware(secret: string) {
  return function (req: Request, _: Response, next: NextFunction): void {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      next(new HTTPError(401, "Aucun JWT n'est défini dans les en-têtes HTTP"));
    } else {
      jwt.verify(token, secret, (err) => {
        if (err) {
          next(new HTTPError(401, err.message));
        } else {
          next();
        }
      });
    }
  };
}

export function errorMiddleware(err: unknown, _: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
  } else {
    if (err instanceof HTTPError) {
      res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message });
    } else if (err instanceof ZodError) {
      const zodError = fromZodError(err);
      res.status(400).json({ statusCode: 400, message: zodError.toString() });
    } else {
      console.error(err);
      res.status(500).json({
        statusCode: 500,
        message: err instanceof Error ? err.message : "Une erreur inattendue s'est produite"
      });
    }
  }
}
