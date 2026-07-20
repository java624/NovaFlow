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
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://novaflow-school.com";
      const webAppUrl = `${siteUrl}/telegram-app`;

      if (role === "teacher") {
        const keyboard = new InlineKeyboard()
          .webApp("🚀 Відкрити NovaFlow App", webAppUrl)
          .row()
          .text("📅 Заплановані уроки", "teacher_schedule")
          .row()
          .text("📋 ДЗ на перевірку", "teacher_homework_check")
          .text("📊 Статистика", "teacher_stats")
          .row()
          .text("🔄 Оновити статус", "refresh_status");

        await ctx.reply(
          `👨‍🏫 *Кабінет вчителя NovaFlow*\n\nВітаємо, **${name}**! Сюди вам приходитимуть сповіщення про нові уроки та запити на підтвердження проведення.`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      } else {
        const keyboard = new InlineKeyboard()
          .webApp("🚀 Відкрити NovaFlow App", webAppUrl)
          .row()
          .text("📚 Мої уроки та Баланс", "my_lessons")
          .text("📝 Моє ДЗ", "my_homework")
          .row()
          .text("💳 Придбати уроки", "pay_info")
          .text("🔄 Оновити", "refresh_status");

        await ctx.reply(
          `🎓 *Особовий кабінет учня NovaFlow*\n\nВітаємо, **${name}**! Оберіть потрібний розділ нижче:`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      }
    };

    // 1. Команда /start
    bot.command("start", async (ctx) => {
      const chatId = ctx.chat.id;
      const startPayload = ctx.match?.trim();

      if (startPayload) {
        // Спробуємо підключити акаунт за ID з посилання
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, role, first_name, full_name")
          .eq("id", startPayload)
          .single();

        if (userProfile) {
          await supabase
            .from("profiles")
            .update({ telegram_chat_id: chatId })
            .eq("id", userProfile.id);

          const name = userProfile.first_name || userProfile.full_name || "користувач";
          await ctx.reply(`✅ **Акаунт успішно підключено через посилання!**`, { parse_mode: "Markdown" });
          await sendMainMenu(ctx, userProfile.role, name);
          return;
        }
      }

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

    // Команда /help
    bot.command("help", async (ctx) => {
      await ctx.reply(
        `📖 *Довідка по роботі з ботом NovaFlow*\n\n` +
        `• /menu — Головне меню кабінету\n` +
        `• /profile — Переглянути дані вашого акаунту\n` +
        `• /help — Показати це повідомлення\n\n` +
        `💡 *Як це працює:*\n` +
        `Якщо ви ще не авторизовані, напишіть вашу електронну пошту, зареєстровану на сайті. Бот автоматично прив'яже ваш Telegram!`,
        { parse_mode: "Markdown" }
      );
    });

    // Команда /profile
    bot.command("profile", async (ctx) => {
      const chatId = ctx.chat.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, full_name, email, lessons_left, learning_language")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!profile) {
        await ctx.reply("⚠️ Ви ще не авторизовані. Будь ласка, введіть ваш Email для прив'язки акаунту.");
        return;
      }

      const roleStr = profile.role === "teacher" ? "Викладач 👨‍🏫" : "Учень 🎓";
      const name = profile.first_name || profile.full_name || "Користувач";
      const balanceText = profile.role === "student" ? `\n💳 Баланс уроків: *${profile.lessons_left ?? 0}*` : "";
      const langText = profile.learning_language ? `\n🌐 Мова навчання: *${profile.learning_language.split(':').pop()}*` : "";

      await ctx.reply(
        `👤 *Ваш профіль NovaFlow:*\n\n` +
        `• Ім'я: **${name}**\n` +
        `• Email: \`${profile.email || "не вказано"}\`\n` +
        `• Роль: *${roleStr}*` +
        balanceText +
        langText,
        { parse_mode: "Markdown" }
      );
    });

    // Команда /menu
    bot.command("menu", async (ctx) => {
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
        await ctx.reply("⚠️ Спершу авторизуйтесь, надіславши ваш Email.");
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
            deadlineStr = `${d.toLocaleDateString("uk-UA")} ${d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
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

      // Отримуємо уроки разом із даними учня
      const { data: lessons } = await supabase
        .from("lessons")
        .select(`
          id, 
          title, 
          date, 
          start_time, 
          student_id,
          student:profiles!lessons_student_id_fkey(first_name, full_name)
        `)
        .eq("teacher_id", teacher.id)
        .neq("status", "completed")
        .order("start_time", { ascending: true });

      if (!lessons || lessons.length === 0) {
        const keyboard = new InlineKeyboard().text("🔙 Назад", "back_to_menu");
        await ctx.editMessageText("📅 У вас немає запланованих занять на найближчий час.", { reply_markup: keyboard });
        return;
      }

      await ctx.editMessageText("📅 *Ваші заплановані уроки:*", { parse_mode: "Markdown" });

      for (const lesson of lessons) {
        // Форматування дати та часу
        let dateStr = lesson.date;
        let timeStr = lesson.start_time;

        if (lesson.start_time && lesson.start_time.includes("T")) {
          const d = new Date(lesson.start_time);
          dateStr = d.toLocaleDateString("uk-UA");
          timeStr = d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
        }

        // @ts-ignore
        const studentName = lesson.student?.first_name || lesson.student?.full_name || "Учень";

        const keyboard = new InlineKeyboard()
          .text("✅ Підтвердити проведення", `confirm_lesson:${lesson.id}`)
          .row()
          .text("❌ Скасувати", `cancel_lesson:${lesson.id}`);

        await ctx.reply(
          `📖 *${lesson.title || "Урок"}*\n🎓 Учень: **${studentName}**\n📆 Дата: ${dateStr || "Не вказано"} ${timeStr || ""}`,
          { parse_mode: "Markdown", reply_markup: keyboard }
        );
      }
    });

    bot.callbackQuery("teacher_stats", async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: teacher } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!teacher) return;

      // Отримуємо всі уроки цього вчителя
      const { data: lessons } = await supabase
        .from("lessons")
        .select("status, student_id")
        .eq("teacher_id", teacher.id);

      const totalLessons = lessons?.length || 0;
      const completedLessons = lessons?.filter((l) => l.status === "completed").length || 0;
      const scheduledLessons = lessons?.filter((l) => l.status === "scheduled").length || 0;
      const activeStudents = new Set(lessons?.map((l) => l.student_id)).size;

      const message = `📊 *Статистика кабінету викладача:*\n\n` +
        `👥 Активних учнів: **${activeStudents}**\n` +
        `📅 Заплановано занять: **${scheduledLessons}**\n` +
        `✅ Проведено занять: **${completedLessons}**\n` +
        `📈 Усього додано занять: **${totalLessons}**\n\n` +
        `💡 _Для детального перегляду профілів учнів використовуйте веб-інтерфейс NovaFlow._`;

      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
      await ctx.editMessageText(message, { parse_mode: "Markdown", reply_markup: keyboard });
    });

    bot.callbackQuery("teacher_homework_check", async (ctx) => {
      await ctx.answerCallbackQuery();
      if (!ctx.chat) return;
      const chatId = ctx.chat.id;

      const { data: teacher } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!teacher) return;

      // Спочатку отримуємо унікальних student_id для цього вчителя з уроків
      const { data: teacherLessons } = await supabase
        .from("lessons")
        .select("student_id")
        .eq("teacher_id", teacher.id);

      const allStudentIds = (teacherLessons || []).map(l => l.student_id);
      const studentIds = allStudentIds.filter((id, index) => id && allStudentIds.indexOf(id) === index) as string[];

      if (studentIds.length === 0) {
        const keyboard = new InlineKeyboard().text("🔙 Назад", "back_to_menu");
        await ctx.editMessageText("ℹ️ У вас немає активних учнів або проведених занять.", { reply_markup: keyboard });
        return;
      }

      // Шукаємо домашні завдання зі статусом 'completed' (надіслані на перевірку)
      const { data: homeworks } = await supabase
        .from("homeworks")
        .select(`
          id,
          title,
          deadline,
          student_id
        `)
        .in("student_id", studentIds)
        .eq("status", "completed")
        .limit(5);

      let message = `📋 *ДЗ, які очікують на вашу перевірку (макс. 5):*\n\n`;

      if (homeworks && homeworks.length > 0) {
        // Отримуємо імена учнів
        const { data: students } = await supabase
          .from("profiles")
          .select("id, full_name, first_name")
          .in("id", homeworks.map(h => h.student_id));

        const studentMap = new Map(students?.map(s => [s.id, s.first_name || s.full_name || "Учень"]));

        homeworks.forEach((hw) => {
          const studentName = studentMap.get(hw.student_id) || "Учень";
          let deadlineStr = hw.deadline;
          if (hw.deadline) {
            const d = new Date(hw.deadline);
            deadlineStr = d.toLocaleDateString("uk-UA");
          }

          message += `• *${hw.title}*\n`;
          message += `  🧑‍🎓 Учень: _${studentName}_\n`;
          if (deadlineStr) message += `  📅 Термін здачі: _${deadlineStr}_\n`;
          message += `\n`;
        });
        message += `💡 _Перевірити роботи та залишити коментарі ви можете в особистому кабінеті на сайті NovaFlow._`;
      } else {
        message += `✅ Немає неперевірених домашніх завдань! Усі роботи перевірені.`;
      }

      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
      await ctx.editMessageText(message, { parse_mode: "Markdown", reply_markup: keyboard });
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