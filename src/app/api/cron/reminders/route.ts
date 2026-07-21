import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Bot, InlineKeyboard } from "grammy";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

export async function GET() {
  try {
    const now = new Date();

    // -------------------------------------------------------------
    // 1. НАГАДУВАННЯ ЗА 1 ГОДИНУ ДО УРОКУ
    // -------------------------------------------------------------
    const windowStart = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 75 * 60 * 1000).toISOString();

    const { data: upcomingLessons } = await supabase
      .from("lessons")
      .select(`
        id, 
        title, 
        start_time, 
        student_id, 
        teacher_id, 
        reminder_sent,
        student:profiles!lessons_student_id_fkey(telegram_chat_id, first_name, full_name),
        teacher:profiles!lessons_teacher_id_fkey(telegram_chat_id, first_name, full_name)
      `)
      .eq("status", "scheduled")
      .eq("reminder_sent", false)
      .gte("start_time", windowStart)
      .lte("start_time", windowEnd);

    if (upcomingLessons && upcomingLessons.length > 0) {
      for (const lesson of upcomingLessons) {
        // @ts-ignore
        const studentChatId = lesson.student?.telegram_chat_id;
        // @ts-ignore
        const teacherChatId = lesson.teacher?.telegram_chat_id;

        const lessonTime = new Date(lesson.start_time).toLocaleTimeString("uk-UA", {
          timeZone: "Europe/Kyiv",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Сповіщення учню
        if (studentChatId) {
          // @ts-ignore
          const teacherName = lesson.teacher?.first_name || lesson.teacher?.full_name || "вчителем";
          await bot.api.sendMessage(
            studentChatId,
            `⏰ *Нагадування про урок!*\n\nЧерез 1 годину (о ${lessonTime}) розпочнеться ваш урок: **"${lesson.title || "Заняття"}"**.\n👨‍🏫 Вчитель: ${teacherName}.\n\nБудьте готові! 🚀`,
            { parse_mode: "Markdown" }
          ).catch(() => {});
        }

        // Сповіщення вчителю
        if (teacherChatId) {
          // @ts-ignore
          const studentName = lesson.student?.first_name || lesson.student?.full_name || "учнем";
          await bot.api.sendMessage(
            teacherChatId,
            `⏰ *Нагадування про урок!*\n\nЧерез 1 годину (о ${lessonTime}) у вас урок: **"${lesson.title || "Заняття"}"**.\n🎓 Учень: ${studentName}.`,
            { parse_mode: "Markdown" }
          ).catch(() => {});
        }

        // Позначаємо, що нагадування надіслано
        await supabase
          .from("lessons")
          .update({ reminder_sent: true })
          .eq("id", lesson.id);
      }
    }

    // -------------------------------------------------------------
    // 2. ЗАПИТ ПІДТВЕРДЖЕННЯ ПІСЛЯ ЗАВЕРШЕННЯ УРОКУ
    // -------------------------------------------------------------
    // Шукаємо уроки, які почалися раніше ніж 15 хвилин тому і досі мають статус 'scheduled'
    const pastWindowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // до 24 годин тому
    const pastWindowEnd = new Date(now.getTime() - 15 * 60 * 1000).toISOString(); // принаймні 15 хв тому

    const { data: endedLessons } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        start_time,
        completion_asked,
        teacher:profiles!lessons_teacher_id_fkey(telegram_chat_id),
        student:profiles!lessons_student_id_fkey(first_name, full_name)
      `)
      .eq("status", "scheduled")
      .or("completion_asked.is.null,completion_asked.eq.false")
      .gte("start_time", pastWindowStart)
      .lte("start_time", pastWindowEnd);

    if (endedLessons && endedLessons.length > 0) {
      for (const lesson of endedLessons) {
        // @ts-ignore
        const teacherChatId = lesson.teacher?.telegram_chat_id;

        if (teacherChatId) {
          // @ts-ignore
          const studentName = lesson.student?.first_name || lesson.student?.full_name || "Учень";

          const keyboard = new InlineKeyboard()
            .text("✅ Підтвердити проведення", `confirm_lesson:${lesson.id}`)
            .row()
            .text("❌ Скасувати", `cancel_lesson:${lesson.id}`);

          await bot.api.sendMessage(
            teacherChatId,
            `🔔 *Заняття вже відбулося?*\n\nУрок **"${lesson.title || "Заняття"}"** з учнем **${studentName}** мав уже закінчитися.\n\nБудь ласка, підтвердіть проведення, щоб зняти 1 урок з балансу учня, або скасуйте його:`,
            { parse_mode: "Markdown", reply_markup: keyboard }
          ).catch(() => {});
        }

        // Позначаємо, що ми вже запитали про цей урок
        await supabase
          .from("lessons")
          .update({ completion_asked: true })
          .eq("id", lesson.id);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: upcomingLessons?.length || 0,
      completionAsked: endedLessons?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}