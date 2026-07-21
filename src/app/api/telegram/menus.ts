import { Context, InlineKeyboard } from "grammy";

/**
 * Допоміжна функція для надсилання головного меню в залежності від ролі користувача
 */
export async function sendMainMenu(ctx: Context, role: string, name: string) {
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
}
