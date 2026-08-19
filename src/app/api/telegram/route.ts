import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { ensureTelegramWebhook, getBot } from "./bot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin;
    const webhookUrl = await ensureTelegramWebhook(origin);

    return NextResponse.json({
      ok: true,
      webhookUrl,
      mode: "webhook",
      message: "Telegram webhook is registered and bot will receive updates through /api/telegram",
    });
  } catch (error: any) {
    console.error("[Telegram Webhook] Registration failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Telegram webhook registration failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    await ensureTelegramWebhook(requestUrl.origin);
  } catch (error) {
    console.error("[Telegram Webhook] Preflight registration failed:", error);
  }

  const handle = webhookCallback(getBot(), "std/http");
  return handle(req);
}