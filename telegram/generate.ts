import { ProxyAgent, setGlobalDispatcher } from "undici";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

// Node.js fetch (undici) doesn't use HTTP_PROXY automatically — set it manually
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

// Rotating post types to keep the channel varied
const POST_TYPES = [
  "практический совет по UI/UX дизайну",
  "разбор дизайна известного продукта из Кремниевой долины",
  "тренд в продуктовом дизайне",
  "совет по работе в Figma",
  "принцип дизайн-системы",
  "история или кейс из жизни дизайнера в Silicon Valley",
  "совет по карьере дизайнера в tech-компании",
  "разбор типографики или визуального стиля",
  "совет по проведению дизайн-ревью или презентации дизайна",
  "инсайт про процессы в крупных tech-компаниях (Apple, Google, Meta, Figma)",
];

export async function generatePost(): Promise<string> {
  const postType = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Ты — опытный продуктовый дизайнер из Кремниевой долины, ведёшь Telegram-канал для русскоязычной аудитории.
Твои посты: полезные, живые, без воды, с практическими инсайтами.
Пиши как человек, не как ChatGPT. Используй Telegram-форматирование (жирный, курсив через * и _).
Длина поста: 150–300 слов. Заканчивай вовлекающим вопросом или призывом к действию.
Добавь 3–5 релевантных эмодзи — органично, не засоряя текст.
НЕ используй хэштеги.`,
      messages: [
        {
          role: "user",
          content: `Напиши пост на тему: ${postType}`,
        },
      ],
    }),
  });

  const data = (await res.json()) as {
    content?: Array<{ type: string; text: string }>;
    error?: { message: string };
  };

  if (data.error) throw new Error(`Anthropic API error: ${data.error.message}`);
  const block = data.content?.[0];
  if (!block || block.type !== "text") throw new Error("Unexpected response");
  return block.text;
}
