import { httpServerHandler } from "cloudflare:node";
import app from "../artifacts/api-server/src/app.js";

app.listen(3000);

const nodeHandler = httpServerHandler({ port: 3000 });

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return nodeHandler(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
