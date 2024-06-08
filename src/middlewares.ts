import type { NextFunction, Response } from "express";
import type { ReqWithParamID } from "./types";

export function validateID(req: ReqWithParamID, _: Response, next: NextFunction): void {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    next(new Error("ID is not a valid number"));
  } else {
    next();
  }
}
