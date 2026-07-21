import { Bot } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerStudentHandlers } from "./handlers/student";
import { registerTeacherHandlers } from "./handlers/teacher";
import { registerNavigationHandlers } from "./handlers/navigation";

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }

    botInstance = new Bot(token);

    // Реєстрація всієї логіки боту з окремих модулів
    registerCommandHandlers(botInstance);
    registerStudentHandlers(botInstance);
    registerTeacherHandlers(botInstance);
    registerNavigationHandlers(botInstance);
  }

  return botInstance;
}
