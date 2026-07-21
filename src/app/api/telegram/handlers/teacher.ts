import { Bot, InlineKeyboard } from "grammy";
import { supabase } from "../supabase";

export function registerTeacherHandlers(bot: Bot) {
  // 1. Розклад занять для вчителя
  bot.callbackQuery("teacher_schedule", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    const { data: teacher, error: teacherError } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_chat_id", chatId)
      .single();

    if (teacherError || !teacher) {
      await ctx.editMessageText("❌ Ваш профіль викладача не знайдено.");
      return;
    }

    // Отримуємо уроки (без колонки 'date', виключаємо завершені та скасовані)
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select(`
        id, 
        title, 
        start_time, 
        student_id,
        student:profiles!lessons_student_id_fkey(first_name, full_name)
      `)
      .eq("teacher_id", teacher.id)
      .not("status", "ilike", "completed")
      .not("status", "ilike", "cancelled")
      .order("start_time", { ascending: true });

    if (lessonsError) {
      console.error("Помилка отримання уроків викладача:", lessonsError);
    }

    if (!lessons || lessons.length === 0) {
      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
      await ctx.editMessageText("📅 У вас немає запланованих занять на найближчий час.", { reply_markup: keyboard });
      return;
    }

    await ctx.editMessageText("📅 *Ваші заплановані уроки:*", { parse_mode: "Markdown" });

    for (const lesson of lessons) {
      // Форматування дати та часу за Києвом
      let formattedDateTime = "Час не вказано";

      if (lesson.start_time) {
        const d = new Date(lesson.start_time);
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

      // @ts-ignore
      const studentName = lesson.student?.first_name || lesson.student?.full_name || "Учень";

      const keyboard = new InlineKeyboard()
        .text("✅ Підтвердити проведення", `confirm_lesson:${lesson.id}`)
        .row()
        .text("❌ Скасувати", `cancel_lesson:${lesson.id}`);

      await ctx.reply(
        `📖 *${lesson.title || "Урок"}*\n🎓 Учень: **${studentName}**\n📆 Дата та час: _${formattedDateTime}_`,
        { parse_mode: "Markdown", reply_markup: keyboard }
      );
    }
  });

  // 2. Статистика для викладача
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
    const completedLessons = lessons?.filter((l) => l.status?.toLowerCase() === "completed").length || 0;
    const scheduledLessons = lessons?.filter((l) => l.status?.toLowerCase() === "scheduled").length || 0;
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

  // 3. Перевірка домашніх завдань
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

    // Отримуємо унікальних student_id для цього вчителя
    const { data: teacherLessons } = await supabase
      .from("lessons")
      .select("student_id")
      .eq("teacher_id", teacher.id);

    const allStudentIds = (teacherLessons || []).map(l => l.student_id);
    const studentIds = allStudentIds.filter((id, index) => id && allStudentIds.indexOf(id) === index) as string[];

    if (studentIds.length === 0) {
      const keyboard = new InlineKeyboard().text("🔙 Назад в меню", "back_to_menu");
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
        let deadlineStr = "";
        if (hw.deadline) {
          const d = new Date(hw.deadline);
          if (!isNaN(d.getTime())) {
            deadlineStr = `${d.toLocaleDateString("uk-UA", { timeZone: "Europe/Kyiv" })} ${d.toLocaleTimeString("uk-UA", { timeZone: "Europe/Kyiv", hour: "2-digit", minute: "2-digit" })}`;
          }
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

  // 4. Підтвердження проведення уроку
  bot.callbackQuery(/^confirm_lesson:(.+)$/, async (ctx) => {
    const lessonId = ctx.match[1];

    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, student_id, title, status")
      .eq("id", lessonId)
      .single();

    if (!lesson || lesson.status?.toLowerCase() === "completed") {
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

    // Сповіщення учню у Telegram
    if (student?.telegram_chat_id) {
      await ctx.api.sendMessage(
        student.telegram_chat_id,
        `🎓 *Урок проведено!*\n\nВчитель підтвердив проведення уроку **"${lesson.title || "Заняття"}"**.\nЗалишок ваших уроків: **${newBalance}**.`,
        { parse_mode: "Markdown" }
      ).catch(() => {});
    }
  });

  // 5. Скасування уроку
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