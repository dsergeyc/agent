import "dotenv/config";
import { generatePost } from "./generate";
import { sendMessage, sendPhoto } from "./telegram";

const count = parseInt(process.argv[2] ?? "3", 10);

(async () => {
  for (let i = 1; i <= count; i++) {
    console.log(`\n[${i}/${count}] Generating post...`);
    const { text, imageUrl } = await generatePost();
    console.log("\n--- PREVIEW ---\n");
    console.log(text);
    if (imageUrl) console.log(`\n🖼  Image: ${imageUrl}`);
    console.log("\n--- SENDING ---\n");
    if (imageUrl) {
      await sendPhoto(imageUrl, text);
    } else {
      await sendMessage(text);
    }
    console.log(`✓ Posted!`);
    if (i < count) {
      console.log("Waiting 3 seconds...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.log(`\nDone! ${count} posts sent.`);
})();
