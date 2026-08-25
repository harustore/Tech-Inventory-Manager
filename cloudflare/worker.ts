import { httpServerHandler } from "cloudflare:node";

type WorkerEnv = {
  ASSETS: Fetcher;
  DATABASE_URL?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  VITE_CLERK_PUBLISHABLE_KEY?: string;
};

let nodeHandlerPromise: Promise<ReturnType<typeof httpServerHandler>> | undefined;

async function getNodeHandler(env: WorkerEnv) {
  if (!nodeHandlerPromise) {
    // The API initializes Drizzle and Clerk at module load. Delay that import
    // until bindings are available in the request context.
    process.env.DATABASE_URL = env.DATABASE_URL;
    process.env.CLERK_SECRET_KEY = env.CLERK_SECRET_KEY;
    process.env.CLERK_PUBLISHABLE_KEY = env.CLERK_PUBLISHABLE_KEY;
    process.env.VITE_CLERK_PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

    nodeHandlerPromise = import("../artifacts/api-server/src/app.js").then(({ default: app }) => {
      app.listen(3000);
      return httpServerHandler({ port: 3000 });
    });
  }

  return nodeHandlerPromise;
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        const nodeHandler = await getNodeHandler(env);
        return await nodeHandler.fetch(request, env, ctx);
      } catch (error) {
        console.error("Cloudflare API exception", error);
        return Response.json(
          {
            error: "Error interno del Worker",
            detail: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
