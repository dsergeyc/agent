/**
 * Run this once to find your channel's numeric ID.
 * Usage: npm run get-channel-id
 *
 * How: the Telegram Bot API returns the chat_id whenever the bot
 * receives any update. For a channel this happens automatically
 * when the bot is added as admin — just forward any message from
 * your channel to the bot, or post a message in the channel after
 * running this script.
 */
import "dotenv/config";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not set in .env");

const res = await fetch(
  `https://api.telegram.org/bot${TOKEN}/getUpdates?limit=20&allowed_updates=["channel_post","message"]`
);
const data = (await res.json()) as {
  ok: boolean;
  result: Array<{
    channel_post?: { chat: { id: number; title: string; username?: string } };
    message?: { chat: { id: number; title?: string; username?: string } };
  }>;
};

if (!data.ok) {
  console.error("API error:", data);
  process.exit(1);
}

if (data.result.length === 0) {
  console.log(
    "No updates yet. Post any message in your channel, then run this script again."
  );
  process.exit(0);
}

const chats = new Map<number, string>();
for (const update of data.result) {
  const chat = update.channel_post?.chat ?? update.message?.chat;
  if (chat) {
    const label = chat.username ? `@${chat.username}` : `ID: ${chat.id}`;
    chats.set(chat.id, `${chat.title ?? "unknown"} — ${label}`);
  }
}

if (chats.size === 0) {
  console.log(
    "No channel chats found. Make sure the bot is admin and post a message in the channel first."
  );
} else {
  console.log("Found chats:\n");
  for (const [id, label] of chats) {
    console.log(`  ${label}`);
    console.log(`  → Set TELEGRAM_CHANNEL_ID=${id}\n`);
  }
}
