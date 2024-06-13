import jwt from "jsonwebtoken";

import type { NextFunction, Request, Response } from "express";
import type { ReqWithParamID } from "./types";

// TODO: add id to req object
export function validateID(req: ReqWithParamID, _: Response, next: NextFunction): void {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    next(new Error("ID is not a valid number"));
  } else {
    next();
  }
}

export function authMiddleware(secret: string) {
  return function(req: Request, _: Response, next: NextFunction): void {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      next(new Error("JWT is not defined"));
    } else {
      jwt.verify(token, secret, (err) => {
        if (err) {
          next(err);
        } else {
          next();
        }
      });
    }
  };
}
