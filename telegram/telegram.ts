const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function checkResponse(res: Response): Promise<void> {
  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
}

export async function sendMessage(text: string): Promise<void> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) throw new Error("TELEGRAM_CHANNEL_ID is not set");

  const res = await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: channelId,
      text,
      parse_mode: "Markdown",
    }),
  });
  await checkResponse(res);
}

export async function sendPhoto(imageUrl: string, caption: string): Promise<void> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) throw new Error("TELEGRAM_CHANNEL_ID is not set");

  const res = await fetch(`${BASE_URL}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: channelId,
      photo: imageUrl,
      caption,
      parse_mode: "Markdown",
    }),
  });
  await checkResponse(res);
}
