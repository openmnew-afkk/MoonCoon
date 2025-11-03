import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { createServer } from "../server/index";

const app = createServer();
const handler = serverless(app);

export default async function (req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
