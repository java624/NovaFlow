import { Bot } from "grammy";
import { supabase } from "../supabase";
import { sendMainMenu } from "../menus";

export function registerNavigationHandlers(bot: Bot) {
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
}
