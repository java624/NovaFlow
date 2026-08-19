import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { ensureTelegramWebhook, getBot } from "./bot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.warn("[Telegram Webhook] TELEGRAM_BOT_TOKEN is missing in environment variables.");
      return NextResponse.json(
        { ok: false, message: "TELEGRAM_BOT_TOKEN is not set" },
        { status: 200 }
      );
    }

    const origin = new URL(req.url).origin;
    const webhookUrl = await ensureTelegramWebhook(origin);

    return NextResponse.json({
      ok: true,
      webhookUrl,
      mode: "webhook",
      message: "Telegram webhook is registered and bot will receive updates through /api/telegram",
    });
  } catch (error: any) {
    console.error("[Telegram Webhook] GET registration failed:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Telegram webhook registration failed" },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.warn("[Telegram Webhook] TELEGRAM_BOT_TOKEN is not set. Returning 200 OK.");
      return new Response("OK", { status: 200 });
    }

    try {
      const requestUrl = new URL(req.url);
      await ensureTelegramWebhook(requestUrl.origin);
    } catch (error) {
      console.error("[Telegram Webhook] Preflight registration warning:", error);
    }

    const bot = getBot();
    const handle = webhookCallback(bot, "std/http");

    const response = await handle(req);
    return response;
  } catch (error: any) {
    console.error("[Telegram Webhook] Error processing update:", error);
    return new Response("OK", { status: 200 });
  }
}