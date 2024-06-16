import express from "express";
import jwt from "jsonwebtoken"
import { authBodySchema } from "../validation";

import type { Router } from "express";

function createAuthRouter(secret: string, password: string): Router {
  const router = express.Router();

  router.post("/", (req, res, next) => {
    try {
      const body = authBodySchema.parse(req.body);
      if (body.password !== password) {
        throw new Error("Password is invalid");
      }
      jwt.sign({ sub: Date.now().toString() }, secret, { expiresIn: "3h" }, (err, token) => {
        if (err) {
          next(err);
        } else {
          res.json({ token });
        }
      });
    } catch (err: unknown) {
      next(err);
    }
  });

  return router;
}

export default createAuthRouter;
