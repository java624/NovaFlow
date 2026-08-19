import { Bot } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerStudentHandlers } from "./handlers/student";
import { registerTeacherHandlers } from "./handlers/teacher";
import { registerNavigationHandlers } from "./handlers/navigation";

let botInstance: Bot | null = null;
let webhookRegistrationPromise: Promise<void> | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }

    botInstance = new Bot(token, {
      // Не запускаємо polling в Next.js. Ми працюємо через webhook.
      // Ручний запуск bot.launch() заборонений, щоб не викликати конфлікти.
    });

    // Реєстрація всієї логіки боту з окремих модулів
    registerCommandHandlers(botInstance);
    registerStudentHandlers(botInstance);
    registerTeacherHandlers(botInstance);
    registerNavigationHandlers(botInstance);
  }

  return botInstance;
}

export function resolveTelegramWebhookUrl(baseUrl?: string): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || process.env.NEXTAUTH_URL;

  if (!siteUrl) {
    throw new Error("Не вказано базовий URL сайту. Додайте NEXT_PUBLIC_SITE_URL або APP_URL");
  }

  return new URL("/api/telegram", siteUrl).toString();
}

export async function ensureTelegramWebhook(baseUrl?: string): Promise<string> {
  const bot = getBot();
  const webhookUrl = resolveTelegramWebhookUrl(baseUrl);

  if (webhookRegistrationPromise) {
    await webhookRegistrationPromise;
    return webhookUrl;
  }

  webhookRegistrationPromise = (async () => {
    try {
      const info = await bot.api.getWebhookInfo();
      if (info.url === webhookUrl) {
        return;
      }

      await bot.api.setWebhook({
        url: webhookUrl,
        drop_pending_updates: true,
        allowed_updates: ["message", "callback_query"],
      });
    } catch (error) {
      console.error("[Telegram Webhook] Failed to register webhook:", error);
      throw error;
    }
  })();

  await webhookRegistrationPromise;
  return webhookUrl;
}
