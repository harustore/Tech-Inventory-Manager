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

// Clerk middleware — skip if no secret key (local dev)
if (process.env.CLERK_SECRET_KEY) {
  app.use(
    clerkMiddleware(() => ({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    })),
  );
}

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
