import "dotenv/config";
import { generateTweet } from "./generate";
import { postTweet } from "./twitter";

(async () => {
  console.log("Generating tweet...");
  const text = await generateTweet();
  console.log("\n--- PREVIEW ---\n");
  console.log(text);
  console.log(`\nCharacters: ${text.length}/280`);
  console.log("\n--- POSTING ---\n");
  const id = await postTweet(text);
  console.log(`Done! Tweet ID: ${id}`);
})();
