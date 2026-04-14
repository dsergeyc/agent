import "dotenv/config";
import { generateTweet } from "./generate";
import { postTweet } from "./twitter";

const count = parseInt(process.argv[2] ?? "3", 10);

(async () => {
  for (let i = 1; i <= count; i++) {
    console.log(`\n[${i}/${count}] Generating tweet...`);
    const text = await generateTweet();
    console.log("\n--- PREVIEW ---\n");
    console.log(text);
    console.log(`\nCharacters: ${text.length}/280`);
    console.log("\n--- POSTING ---\n");
    const id = await postTweet(text);
    console.log(`✓ Posted! ID: ${id}`);
    if (i < count) {
      console.log("Waiting 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  console.log(`\nDone! ${count} tweets posted.`);
})();
