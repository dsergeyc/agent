/**
 * One-shot script — posts immediately without waiting for the schedule.
 * Usage: npm run post-now
 */
import "dotenv/config";
import { generatePost } from "./generate";
import { sendMessage } from "./telegram";

(async () => {
  console.log("Generating post...");
  const text = await generatePost();
  console.log("\n--- PREVIEW ---\n");
  console.log(text);
  console.log("\n--- SENDING ---\n");
  await sendMessage(text);
  console.log("Done!");
})();
