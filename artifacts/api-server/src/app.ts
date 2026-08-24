import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes/index.js";
import mercadoLibreRouter from "./routes/mercadolibre.js";

const app = express();

// Keep request logging runtime-neutral: pino-http depends on Node internals
// that are unavailable when this API is bundled into a Cloudflare Worker.
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`${req.method} ${req.url?.split("?")[0]} ${res.statusCode} ${Date.now() - startedAt}ms`);
    }
  });
  next();
});

// CORS: allow requests from Vercel frontend (same domain in production)
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/mercadolibre", mercadoLibreRouter);

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

app.use("/api", router);

export default app;
