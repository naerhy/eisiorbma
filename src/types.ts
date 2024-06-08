import type { Request } from "express";

export interface ReqWithParamID extends Request {
  params: {
    id?: string;
  }
}
