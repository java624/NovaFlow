import { Bot, webhookCallback } from "grammy";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Bot initialisation ────────────────────────────────────────────
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN is not defined in environment variables.",
  );
}

const bot = new Bot(token);

// ── Supabase Admin Client ────────────────────────────────────────
// Використовуємо SUPABASE_SERVICE_ROLE_KEY (якщо є) або NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Commands ──────────────────────────────────────────────────────
bot.command("start", async (ctx) => {
  const userId = ctx.match?.trim(); // Зчитуємо USER_ID з посилання ?start=USER_ID
  const chatId = ctx.chat.id;

  // Якщо користувач перейшов за посиланням з особистого кабінету
  if (userId) {
    const { error } = await supabase
      .from("profiles")
      .update({ telegram_chat_id: String(chatId) })
      .eq("id", userId);

    if (!error) {
      await ctx.reply(
        "🎉 *Акаунт успішно прив'язано!*\n\n" +
          "Тепер ви отримуватимете сповіщення про уроки, нагадування та нові матеріали NovaFlow прямо сюди.",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📚 Мої уроки", callback_data: "my_lessons" }],
              [{ text: "💳 Оплатити", callback_data: "pay" }],
            ],
          },
        }
      );
      return;
    } else {
      console.error("Помилка збереження telegram_chat_id:", error);
    }
  }

  // Звичайне вітальне повідомлення (якщо просто натиснули /start без параметрів)
  await ctx.reply(
    "👋 *Вітаємо в NovaFlow!*\n\n" +
      "Я — ваш помічник. Оберіть дію нижче:",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 Мої уроки", callback_data: "my_lessons" },
            { text: "💳 Оплатити", callback_data: "pay" },
          ],
          [
            { text: "🆔 Мій Chat ID", callback_data: "chat_id" },
          ],
        ],
      },
    }
  );
});

// ── Callback queries ──────────────────────────────────────────────
bot.callbackQuery("my_lessons", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "📚 *Ваші уроки*\n\n" +
      "Перейдіть до [дашборда](https://novaflow.app/dashboard) " +
      "аби переглянути розклад та матеріали.",
    { parse_mode: "Markdown" }
  );
});

bot.callbackQuery("pay", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "💳 *Оплата*\n\n" +
      "Запланувати та здійснити оплату можна у розділі " +
      "[Payments](https://novaflow.app/dashboard).",
    { parse_mode: "Markdown" }
  );
});

bot.callbackQuery("chat_id", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `🆔 *Ваш Chat ID:* \`${ctx.chat?.id ?? "N/A"}\``,
    { parse_mode: "Markdown" }
  );
});

// ── Webhook handler (Next.js Route Handler) ───────────────────────
const handleUpdate = webhookCallback(bot, "std/http");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = new URL(req.url);
  const response = await handleUpdate(
    new Request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}