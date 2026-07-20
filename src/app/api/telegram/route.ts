import { Bot, webhookCallback } from "grammy";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let bot: Bot | null = null;

function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    bot = new Bot(token);

    // 1. Команда /start
    bot.command("start", async (ctx) => {
      const chatId = ctx.chat.id;

      // Перевіряємо, чи цей Telegram вже прив'язаний до якогось акаунта
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .eq("telegram_chat_id", chatId)
        .single();

      if (profile) {
        const name = profile.first_name || profile.full_name || "користувач";
        
        if (profile.role === "teacher") {
          await ctx.reply(
            `👨‍🏫 *Вітаємо у робочому кабінеті вчителя, ${name}!*\n\nСюди вам приходитимуть сповіщення про завершені уроки для підтвердження.`,
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "📅 Мій розклад", callback_data: "teacher_schedule" }]
                ]
              }
            }
          );
        } else {
          await ctx.reply(
            `🎉 *Вітаємо, ${name}!*\n\nВаш акаунт підключено. Оберіть потрібну дію в меню нижче:`,
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "📚 Мої уроки", callback_data: "my_lessons" }],
                  [{ text: "💳 Оплатити", callback_data: "pay" }]
                ]
              }
            }
          );
        }
      } else {
        // Якщо акаунт ще не прив'язаний — просимо Email
        await ctx.reply(
          `👋 *Вітаємо у NovaFlow School!*\n\nДля початку роботи, будь ласка, **напишіть сюди ваш Email**, вказаний при реєстрації на сайті.`,
          { parse_mode: "Markdown" }
        );
      }
    });

    // 2. Обробка текстових повідомлень (Введення Email)
    bot.on("message:text", async (ctx) => {
      const text = ctx.message.text.trim().toLowerCase();
      const chatId = ctx.chat.id;

      // Ігноруємо команди, які починаються з /
      if (text.startsWith("/")) return;

      // Проста перевірка чи схожий текст на Email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

      if (!isEmail) {
        await ctx.reply("⚠️ Будь ласка, введіть коректну електронну адресу (наприклад: `user@gmail.com`).", { parse_mode: "Markdown" });
        return;
      }

      // Перевіряємо чи прив'язаний вже цей чат
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_chat_id", chatId)
        .single();

      if (existingProfile) {
        await ctx.reply("Ваш Telegram вже успішно прив'язаний до акаунта!");
        return;
      }

      // Шукаємо користувача в Supabase за email
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("id, role, first_name, full_name, email")
        .eq("email", text)
        .single();

      if (error || !userProfile) {
        await ctx.reply(
          `❌ **Акаунт із поштою \`${text}\` не знайдено.**\n\nПеревірте правильність написання або зареєструйтесь на сайті NovaFlow.`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Прив'язуємо telegram_chat_id до знайденого профілю
      await supabase
        .from("profiles")
        .update({ telegram_chat_id: chatId })
        .eq("id", userProfile.id);

      const userName = userProfile.first_name || userProfile.full_name || "користувач";

      if (userProfile.role === "teacher") {
        await ctx.reply(
          `✅ **Авторизація успішна!**\n\n👨‍🏫 Вітаємо, вчителю **${userName}**! Тепер ви отримуватимете сповіщення про завершені уроки прямо сюди.`,
          { parse_mode: "Markdown" }
        );
      } else {
        await ctx.reply(
          `✅ **Авторизація успішна!**\n\n🎓 Вітаємо, **${userName}**! Ваш акаунт учня прив'язано до Telegram.`,
          { parse_mode: "Markdown" }
        );
      }
    });

    // 3. Обробка кнопок (для учнів та вчителів)
    bot.callbackQuery("my_lessons", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply("📚 **Ваші уроки**\n\nПерейдіть до дашборда на сайті, аби переглянути розклад та матеріали.");
    });

    bot.callbackQuery("pay", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply("💳 **Оплата**\n\nЗапланувати та здійснити оплату можна у розділі Payments на сайті.");
    });

    // 4. Підтвердження уроку вчителем
    bot.callbackQuery(/^confirm_lesson:(.+)$/, async (ctx) => {
      const lessonId = ctx.match[1];

      const { data: lesson } = await supabase
        .from("lessons")
        .select("id, student_id, title, status")
        .eq("id", lessonId)
        .single();

      if (!lesson || lesson.status === "completed") {
        await ctx.answerCallbackQuery({ text: "Цей урок вже підтверджено або не знайдено!" });
        return;
      }

      await supabase
        .from("lessons")
        .update({ status: "completed" })
        .eq("id", lessonId);

      const { data: student } = await supabase
        .from("profiles")
        .select("lessons_left, telegram_chat_id")
        .eq("id", lesson.student_id)
        .single();

      const currentBalance = student?.lessons_left ?? 0;
      const newBalance = Math.max(0, currentBalance - 1);

      await supabase
        .from("profiles")
        .update({ lessons_left: newBalance })
        .eq("id", lesson.student_id);

      await ctx.answerCallbackQuery({ text: "Урок успішно проведено!" });
      await ctx.editMessageText(
        `✅ **Урок "${lesson.title}" підтверджено!**\n1 урок списано з балансу учня. Залишок: **${newBalance}**.`,
        { parse_mode: "Markdown" }
      );

      if (student?.telegram_chat_id) {
        await bot.api.sendMessage(
          student.telegram_chat_id,
          `🎓 *Урок проведено!*\n\nВаш урок **"${lesson.title}"** підтверджено вчителем.\nЗалишок ваших уроків: **${newBalance}**.`,
          { parse_mode: "Markdown" }
        );
      }
    });

    // 5. Скасування уроку вчителем
    bot.callbackQuery(/^cancel_lesson:(.+)$/, async (ctx) => {
      const lessonId = ctx.match[1];

      await supabase
        .from("lessons")
        .update({ status: "cancelled" })
        .eq("id", lessonId);

      await ctx.answerCallbackQuery({ text: "Урок скасовано." });
      await ctx.editMessageText("❌ **Урок відмічено як скасований.** Баланс учня не змінювався.");
    });
  }
  return bot;
}

export async function POST(req: Request) {
  const handle = webhookCallback(getBot(), "std/http");
  return handle(req);
}