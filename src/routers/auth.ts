import express from "express";
import jwt from "jsonwebtoken";
import { authBodySchema } from "../validation";

import type { Router } from "express";
import { HTTPError } from "../shared";

function createAuthRouter(secret: string, password: string): Router {
  const router = express.Router();

  router.post("/", (req, res, next) => {
    try {
      const body = authBodySchema.parse(req.body);
      if (body.password !== password) {
        throw new HTTPError(400, "Le mot de passe est incorrect");
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
