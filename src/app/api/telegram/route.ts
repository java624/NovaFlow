import { webhookCallback } from "grammy";
import { getBot } from "./bot";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const handle = webhookCallback(getBot(), "std/http");
  return handle(req);
}