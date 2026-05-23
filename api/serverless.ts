import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createServer } from "../server/index";

/**
 * Vercel routes all /api/* here (see vercel.json).
 * Use the same Express app as local dev — not the legacy mock handler.
 */
const app = createServer();
const expressHandler = serverless(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return expressHandler(req, res);
}
