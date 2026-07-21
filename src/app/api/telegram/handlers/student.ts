import { Bot, InlineKeyboard } from "grammy";
import { supabase } from "../supabase";

export function registerStudentHandlers(bot: Bot) {
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

    // Отримуємо найближчі уроки без суворого прив'язування до регістру слова Scheduled/scheduled
    const { data: upcomingLessons } = await supabase
      .from("lessons")
      .select("title, start_time, date, status")
      .eq("student_id", profile.id)
      .ilike("status", "scheduled") // ilike ігнорує регістр (Scheduled / scheduled)
      .order("start_time", { ascending: true })
      .limit(5);

    let message = `📊 *Ваш баланс:* **${profile.lessons_left ?? 0}** уроків\n\n`;

    if (upcomingLessons && upcomingLessons.length > 0) {
      message += `📅 *Заплановані уроки:*\n\n`;
      upcomingLessons.forEach((l) => {
        let formattedDateTime = "";

        // Якщо в start_time є повноцінна дата й час
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

        // Якщо дата і час розбиті на окремі поля
        if (!formattedDateTime) {
          formattedDateTime = `${l.date || ""} ${l.start_time || ""}`.trim();
        }

        message += `• **${l.title || "Заняття"}** — _${formattedDateTime}_\n`;
      });
    } else {
      message += `ℹ️ У вас немає незавершених або запланованих занять.`;
    }

    const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");

    await ctx.editMessageText(message, { parse_mode: "Markdown", reply_markup: keyboard });
  });

  bot.callbackQuery("my_homework", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_chat_id", chatId)
      .single();

    if (!profile) return;

    const { data: homeworks } = await supabase
      .from("homeworks")
      .select("title, description, deadline, status")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(3);

    let message = `📝 *Ваші домашні завдання:*\n\n`;

    if (homeworks && homeworks.length > 0) {
      homeworks.forEach((hw) => {
        const statusMap: Record<string, string> = {
          pending: "⏳ Нове (очікує виконання)",
          completed: "📤 Надіслано на перевірку",
          done: "📤 Надіслано на перевірку",
          reviewed: "🔍 Перевірено викладачем"
        };
        const statusStr = statusMap[hw.status] || hw.status;
        
        let deadlineStr = hw.deadline;
        if (hw.deadline) {
          const d = new Date(hw.deadline);
          deadlineStr = `${d.toLocaleDateString("uk-UA", { timeZone: "Europe/Kyiv" })} ${d.toLocaleTimeString("uk-UA", { timeZone: "Europe/Kyiv", hour: "2-digit", minute: "2-digit" })}`;
        }

        message += `📌 *${hw.title}*\n`;
        message += `• Статус: _${statusStr}_\n`;
        if (deadlineStr) message += `• Термін здачі: _${deadlineStr}_\n`;
        if (hw.description) message += `• Опис: ${hw.description.slice(0, 100)}${hw.description.length > 100 ? "..." : ""}\n`;
        message += `\n`;
      });
    } else {
      message += `ℹ️ У вас немає виданих домашніх завдань.`;
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
}