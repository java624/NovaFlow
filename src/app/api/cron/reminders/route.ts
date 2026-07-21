import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Bot } from "grammy";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

export async function GET() {
  try {
    const now = new Date();
    // Визначення часового вікна: від 45 до 75 хвилин від поточного моменту
    const windowStart = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 75 * 60 * 1000).toISOString();

    // 1. Шукаємо уроки, які стануться приблизно через годину і нагадування для яких ще не надсилалося
    const { data: upcomingLessons, error } = await supabase
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!upcomingLessons || upcomingLessons.length === 0) {
      return NextResponse.json({ message: "Немає уроків для нагадування" });
    }

    for (const lesson of upcomingLessons) {
      // @ts-ignore
      const studentChatId = lesson.student?.telegram_chat_id;
      // @ts-ignore
      const teacherChatId = lesson.teacher?.telegram_chat_id;

      // 🕒 Встановлюємо правильний часовий пояс України (Europe/Kyiv)
      const lessonTime = new Date(lesson.start_time).toLocaleTimeString("uk-UA", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        minute: "2-digit",
      });

      // 2. Сповіщення УЧНЕВІ
      if (studentChatId) {
        // @ts-ignore
        const teacherName = lesson.teacher?.first_name || lesson.teacher?.full_name || "вчителем";
        await bot.api.sendMessage(
          studentChatId,
          `⏰ *Нагадування про урок!*\n\nЧерез 1 годину (о ${lessonTime}) розпочнеться ваш урок: **"${lesson.title || "Заняття"}"**.\n👨‍🏫 Вчитель: ${teacherName}.\n\nБудьте готові! 🚀`,
          { parse_mode: "Markdown" }
        ).catch(() => {});
      }

      // 3. Сповіщення ВЧИТЕЛЕВІ
      if (teacherChatId) {
        // @ts-ignore
        const studentName = lesson.student?.first_name || lesson.student?.full_name || "учнем";
        await bot.api.sendMessage(
          teacherChatId,
          `⏰ *Нагадування про урок!*\n\nЧерез 1 годину (о ${lessonTime}) у вас урок: **"${lesson.title || "Заняття"}"**.\n🎓 Учень: ${studentName}.`,
          { parse_mode: "Markdown" }
        ).catch(() => {});
      }

      // 4. Позначаємо в БД, що нагадування надіслано
      await supabase
        .from("lessons")
        .update({ reminder_sent: true })
        .eq("id", lesson.id);
    }

    return NextResponse.json({ success: true, processed: upcomingLessons.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}