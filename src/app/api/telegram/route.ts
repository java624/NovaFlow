import { Bot, webhookCallback, InlineKeyboard } from "grammy";
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

    // Допоміжна функція для надсилання головного меню в залежності від ролі
    const sendMainMenu = async (ctx: any, role: string, name: string) => {
      if (role === "teacher") {
        const keyboard = new InlineKeyboard()
          .text("📅 Заплановані уроки", "teacher_schedule")
          .row()
          .text("🔄 Оновити статус", "refresh_status");

        await ctx.reply(
          `👨‍🏫 *Кабінет вчителя NovaFlow*\n\nВітаємо, **${name}**! Сюди вам приходитимуть сповіщення про нові уроки та запити на підтвердження проведення.`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      } else {
        const keyboard = new InlineKeyboard()
          .text("📚 Мої уроки та Баланс", "my_lessons")
          .text("💳 Придбати уроки", "pay_info")
          .row()
          .text("🔄 Оновити", "refresh_status");

        await ctx.reply(
          `🎓 *Особовий кабінет учня NovaFlow*\n\nВітаємо, **${name}**! Оберіть потрібний розділ нижче:`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      }
    }

    // 1. Команда /start
    bot.command("start", async (ctx) => {
      const chatId = ctx.chat.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .eq("telegram_chat_id", chatId)
        .single();

      if (profile) {
        const name = profile.first_name || profile.full_name || "користувач";
        await sendMainMenu(ctx, profile.role, name);
      } else {
        await ctx.reply(
          `👋 *Вітаємо у NovaFlow School!*\n\nДля початку роботи, будь ласка, **напишіть сюди ваш Email**, вказаний при реєстрації на сайті.`,
          { parse_mode: "Markdown" }
        );
      }
    });

    // 2. Обробка введення Email
    bot.on("message:text", async (ctx) => {
      const text = ctx.message.text.trim().toLowerCase();
      const chatId = ctx.chat.id;

      if (text.startsWith("/")) return;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

      if (!isEmail) {
        await ctx.reply("⚠️ Будь ласка, введіть коректну електронну адресу (наприклад: `user@gmail.com`).", { parse_mode: "Markdown" });
        return;
      }

      // Шукаємо користувача за email
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("id, role, first_name, full_name, email")
        .eq("email", text)
        .single();

      if (error || !userProfile) {
        await ctx.reply(
          `❌ **Акаунт із поштою \`${text}\` не знайдено.**\n\nПеревірте правильність або зареєструйтесь на сайті NovaFlow.`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Прив'язуємо telegram_chat_id
      await supabase
        .from("profiles")
        .update({ telegram_chat_id: chatId })
        .eq("id", userProfile.id);

      const userName = userProfile.first_name || userProfile.full_name || "користувач";

      await ctx.reply(`✅ **Авторизація успішна!**`, { parse_mode: "Markdown" });
      await sendMainMenu(ctx, userProfile.role, userName);
    });

    // 3. Обробка кнопок для учня
    bot.callbackQuery("my_lessons", async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, lessons_left")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!profile) return;

      // Отримуємо найближчі scheduled уроки
      const { data: upcomingLessons } = await supabase
        .from("lessons")
        .select("title, start_time, date")
        .eq("student_id", profile.id)
        .eq("status", "scheduled")
        .limit(3);

      let message = `📊 *Ваш баланс:* **${profile.lessons_left ?? 0}** уроків\n\n`;

      if (upcomingLessons && upcomingLessons.length > 0) {
        message += `📅 *Заплановані уроки:*\n`;
        upcomingLessons.forEach((l) => {
          message += `• ${l.title || "Заняття"} — ${l.date || ""} ${l.start_time || ""}\n`;
        });
      } else {
        message += `ℹ️ У вас немає незавершених або запланованих занять.`;
      }

      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");

      await ctx.editMessageText(message, { parse_mode: "Markdown", reply_markup: keyboard });
    });

    bot.callbackQuery("pay_info", async (ctx) => {
      await ctx.answerCallbackQuery();
      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
      await ctx.editMessageText(
        `💳 *Поповнення балансу*\n\nДля придбання пакету уроків перейдіть у свій особистий кабінет на сайті NovaFlow.`,
        { parse_mode: "Markdown", reply_markup: keyboard }
      );
    });

    // 4. Обробка кнопок для вчителя
    bot.callbackQuery("teacher_schedule", async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: teacher } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!teacher) return;

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, date, start_time, student_id")
        .eq("teacher_id", teacher.id)
        .eq("status", "scheduled");

      if (!lessons || lessons.length === 0) {
        const keyboard = new InlineKeyboard().text("🔙 Назад", "back_to_menu");
        await ctx.editMessageText("📅 У вас немає запланованих занять на найближчий час.", { reply_markup: keyboard });
        return;
      }

      await ctx.editMessageText("📅 *Ваші заплановані уроки:*", { parse_mode: "Markdown" });

      for (const lesson of lessons) {
        const keyboard = new InlineKeyboard()
          .text("✅ Підтвердити проведення", `confirm_lesson:${lesson.id}`)
          .row()
          .text("❌ Скасувати", `cancel_lesson:${lesson.id}`);

        await ctx.reply(
          `📖 *${lesson.title || "Урок"}*\n📆 Дата: ${lesson.date || "Не вказано"} ${lesson.start_time || ""}`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      }
    });

    // Назад у головне меню
    bot.callbackQuery("back_to_menu", async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .eq("telegram_chat_id", chatId)
        .single();

      if (profile) {
        const name = profile.first_name || profile.full_name || "користувач";
        await ctx.deleteMessage();
        await sendMainMenu(ctx, profile.role, name);
      }
    });

    // Оновити меню
    bot.callbackQuery("refresh_status", async (ctx) => {
      await ctx.answerCallbackQuery("Оновлено!");
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name")
        .eq("telegram_chat_id", chatId)
        .single();

      if (profile) {
        const name = profile.first_name || profile.full_name || "користувач";
        await ctx.deleteMessage();
        await sendMainMenu(ctx, profile.role, name);
      }
    });

    // 5. Логіка підтвердження уроку вчителем
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

      // Змінюємо статус уроку на completed
      await supabase
        .from("lessons")
        .update({ status: "completed" })
        .eq("id", lessonId);

      // Списуємо 1 урок у учня
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

      await ctx.answerCallbackQuery({ text: "Урок підтверджено!" });
      await ctx.editMessageText(
        `✅ **Урок "${lesson.title || "Заняття"}" успішно підтверджено!**\n1 урок списано. Новий баланс учня: **${newBalance}**.`,
        { parse_mode: "Markdown" }
      );

      // Сповіщення учню у Telegram, якщо його чат прив'язаний
      if (student?.telegram_chat_id) {
        await bot!.api.sendMessage(
          student.telegram_chat_id,
          `🎓 *Урок проведено!*\n\nВчитель підтвердив проведення уроку **"${lesson.title || "Заняття"}"**.\nЗалишок ваших уроків: **${newBalance}**.`,
          { parse_mode: "Markdown" }
        );
      }
    });

    // 6. Скасування уроку
    bot.callbackQuery(/^cancel_lesson:(.+)$/, async (ctx) => {
      const lessonId = ctx.match[1];

      await supabase
        .from("lessons")
        .update({ status: "cancelled" })
        .eq("id", lessonId);

      await ctx.answerCallbackQuery({ text: "Урок скасовано" });
      await ctx.editMessageText("❌ **Урок скасовано.** Баланс учня залишився без змін.");
    });
  }
  return bot;
}

export async function POST(req: Request) {
  const handle = webhookCallback(getBot(), "std/http");
  return handle(req);
}