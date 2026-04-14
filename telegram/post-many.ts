/**
 * Posts N times with a short delay between each.
 * Usage: npm run post-many -- 3
 */
import "dotenv/config";
import { generatePost } from "./generate";
import { sendMessage } from "./telegram";

const count = parseInt(process.argv[2] ?? "3", 10);

for (let i = 1; i <= count; i++) {
  console.log(`\n[${i}/${count}] Generating post...`);
  const text = await generatePost();
  console.log("\n--- PREVIEW ---\n");
  console.log(text);
  console.log("\n--- SENDING ---\n");
  await sendMessage(text);
  console.log(`✓ Posted!`);
  if (i < count) {
    console.log("Waiting 3 seconds...");
    await new Promise((r) => setTimeout(r, 3000));
  }
}
console.log(`\nDone! ${count} posts sent.`);
