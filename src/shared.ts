import type { Request } from "express";

export interface ReqWithParamID extends Request {
  params: {
    id?: string;
  };
}

export class HTTPError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
