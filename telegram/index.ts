import "dotenv/config";
import cron from "node-cron";
import { generatePost } from "./generate";
import { sendMessage, sendPhoto } from "./telegram";

const SCHEDULE = process.env.POST_SCHEDULE ?? "0 7,16 * * *";

async function postToChannel(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Generating post...`);
  try {
    const { text, imageUrl } = await generatePost();
    if (imageUrl) {
      await sendPhoto(imageUrl, text);
    } else {
      await sendMessage(text);
    }
    console.log(`[${new Date().toISOString()}] Posted successfully.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed to post:`, err);
  }
}

console.log(`Scheduler started. Cron: "${SCHEDULE}"`);
cron.schedule(SCHEDULE, postToChannel, { timezone: "Europe/Moscow" });
