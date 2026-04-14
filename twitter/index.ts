import "dotenv/config";
import cron from "node-cron";
import { generateTweet } from "./generate";
import { postTweet } from "./twitter";

const SCHEDULE = process.env.POST_SCHEDULE ?? "0 7,16 * * *";

async function post(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Generating tweet...`);
  try {
    const text = await generateTweet();
    const id = await postTweet(text);
    console.log(`[${new Date().toISOString()}] Posted! ID: ${id}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed:`, err);
  }
}

console.log(`X scheduler started. Cron: "${SCHEDULE}"`);
cron.schedule(SCHEDULE, post, { timezone: "Europe/Moscow" });
