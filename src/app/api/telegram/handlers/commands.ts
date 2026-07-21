import { Bot } from "grammy";
import { supabase } from "../supabase";
import { sendMainMenu } from "../menus";

export function registerCommandHandlers(bot: Bot) {
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
}
