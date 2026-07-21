import { Bot, InlineKeyboard } from "grammy";
import { supabase } from "../supabase";

export function registerStudentHandlers(bot: Bot) {
  // 1. Мої уроки та Баланс
  bot.callbackQuery("my_lessons", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    // Отримуємо профіль учня за telegram_chat_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, lessons_left")
      .eq("telegram_chat_id", chatId)
      .single();

    if (profileError || !profile) {
      console.error("Профіль не знайдено для chatId:", chatId, profileError);
      await ctx.editMessageText(
        "❌ Ваш профіль не знайдено. Будь ласка, перезапустіть бота за допомогою команди /start."
      );
      return;
    }

    // Вибираємо заплановані уроки (ігноруємо completed та cancelled)
    const { data: upcomingLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("title, start_time, status")
      .eq("student_id", profile.id)
      .not("status", "ilike", "completed")
      .not("status", "ilike", "cancelled")
      .order("start_time", { ascending: true })
      .limit(5);

    if (lessonsError) {
      console.error("Помилка при запиті уроків:", lessonsError);
    }

    let message = `📊 *Ваш баланс:* **${profile.lessons_left ?? 0}** уроків\n\n`;

    if (upcomingLessons && upcomingLessons.length > 0) {
      message += `📅 *Заплановані уроки:*\n\n`;
      upcomingLessons.forEach((l) => {
        let formattedDateTime = "Час не вказано";

        if (l.start_time) {
          const d = new Date(l.start_time);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString("uk-UA", {
              timeZone: "Europe/Kyiv",
              day: "2-digit",
              month: "2-digit",
            });
            const timeStr = d.toLocaleTimeString("uk-UA", {
              timeZone: "Europe/Kyiv",
              hour: "2-digit",
              minute: "2-digit",
            });
            formattedDateTime = `${dateStr} о ${timeStr}`;
          }
        }

        message += `• **${l.title || "Заняття"}** — _${formattedDateTime}_\n`;
      });
    } else {
      message += `ℹ️ У вас немає незавершених або запланованих занять.`;
    }

    const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");

    await ctx.editMessageText(message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // 2. Мої домашні завдання
  bot.callbackQuery("my_homework", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_chat_id", chatId)
      .single();

    if (!profile) {
      await ctx.editMessageText(
        "❌ Ваш профіль не знайдено. Будь ласка, перезапустіть бота за допомогою /start."
      );
      return;
    }

    const { data: homeworks, error: hwError } = await supabase
      .from("homeworks")
      .select("title, description, deadline, status")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (hwError) {
      console.error("Помилка при запиті ДЗ:", hwError);
    }

    let message = `📝 *Ваші домашні завдання:*\n\n`;

    if (homeworks && homeworks.length > 0) {
      homeworks.forEach((hw) => {
        const statusMap: Record<string, string> = {
          pending: "⏳ Нове (очікує виконання)",
          completed: "📤 Надіслано на перевірку",
          done: "📤 Надіслано на перевірку",
          reviewed: "🔍 Перевірено викладачем",
        };
        const statusStr = statusMap[hw.status] || hw.status;

        let deadlineStr = "";
        if (hw.deadline) {
          const d = new Date(hw.deadline);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toLocaleDateString("uk-UA", {
              timeZone: "Europe/Kyiv",
              day: "2-digit",
              month: "2-digit",
            });
            const timeStr = d.toLocaleTimeString("uk-UA", {
              timeZone: "Europe/Kyiv",
              hour: "2-digit",
              minute: "2-digit",
            });
            deadlineStr = `${dateStr} ${timeStr}`;
          }
        }

        message += `📌 *${hw.title}*\n`;
        message += `• Статус: _${statusStr}_\n`;
        if (deadlineStr) message += `• Термін здачі: _${deadlineStr}_\n`;
        if (hw.description) {
          const shortDesc =
            hw.description.length > 100
              ? hw.description.slice(0, 100) + "..."
              : hw.description;
          message += `• Опис: ${shortDesc}\n`;
        }
        message += `\n`;
      });
    } else {
      message += `ℹ️ У вас немає виданих домашніх завдань.`;
    }

    const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");

    await ctx.editMessageText(message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // 3. Інформація про оплату
  bot.callbackQuery("pay_info", async (ctx) => {
    await ctx.answerCallbackQuery();
    const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
    await ctx.editMessageText(
      `💳 *Поповнення балансу*\n\nДля придбання пакету уроків скористайтеся кабінетом у нашому Telegram Mini App або перейдіть на сайт NovaFlow.`,
      { parse_mode: "Markdown", reply_markup: keyboard }
    );
  });
}