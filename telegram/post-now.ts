import "dotenv/config";
import { generatePost } from "./generate";
import { sendMessage, sendPhoto } from "./telegram";

(async () => {
  console.log("Generating post...");
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
  console.log("Done!");
})();
