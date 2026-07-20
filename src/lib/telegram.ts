const TELEGRAM_API = "https://api.telegram.org";

/**
 * Sends a text notification to a Telegram chat via the Bot API.
 * @param chatId  - Telegram chat ID (string or number)
 * @param message - Markdown-formatted message text
 */
export async function sendTelegramNotification(
  chatId: string | number,
  message: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN is not set – notification skipped",
    );
    return;
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(
        `[telegram] sendMessage failed (${res.status}): ${errorBody}`,
      );
    }
  } catch (err) {
    console.error("[telegram] Network error while sending notification:", err);
  }
}