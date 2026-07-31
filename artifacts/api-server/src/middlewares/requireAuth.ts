import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!getAuth(req).userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
