import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { persist } from "@workspace/db";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS: allow requests from Vercel frontend (same domain in production)
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fail closed: without a Clerk secret key the API must not start exposed.
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is required to start the API server");
}

app.use((req, res, next) => {
  const clerkMw = clerkMiddleware(() => ({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }));
  clerkMw(req, res, (err) => {
    if (err) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });
});

// Persist SQLite DB to disk after every API response
app.use((_req, res, next) => {
  const originalEnd = res.end.bind(res);
  res.end = (...args: Parameters<typeof res.end>) => {
    persist();
    return originalEnd(...args);
  };
  next();
});

app.use("/api", router);

export default app;
