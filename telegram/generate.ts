import { ProxyAgent, setGlobalDispatcher } from "undici";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

// Node.js fetch (undici) doesn't use HTTP_PROXY automatically — set it manually
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const POST_TYPES = [
  "тренд в дизайне или продуктовой разработке, который сейчас активно обсуждается в Silicon Valley",
  "как Big Tech компании (Apple, Google, Meta, Figma, OpenAI) подходят к дизайну — факты и наблюдения",
  "чем культура работы дизайнера в Silicon Valley реально отличается от России и Европы",
  "карьера дизайнера в американских tech-компаниях: что работодатели ценят на самом деле",
  "как дизайн и AI меняют работу дизайнеров прямо сейчас — что происходит в индустрии",
  "мифы о работе и жизни в Silicon Valley, которые распространены среди дизайнеров",
  "что такое design systems, product thinking, design ops — как это устроено в крупных компаниях",
  "как устроен процесс найма дизайнеров в американских tech-компаниях",
  "тренд или инструмент, который сейчас набирает популярность среди дизайнеров в SV",
  "как дизайнеру из России или СНГ строить карьеру в международных компаниях — практические факты",
];

// Unsplash topics that match each post type (same order)
const UNSPLASH_QUERIES = [
  "silicon valley office",
  "design team collaboration",
  "product design",
  "san francisco city",
  "job interview tech",
  "startup office",
  "designer working",
  "career growth",
  "design review whiteboard",
  "usa tech city",
];

export interface GeneratedPost {
  text: string;
  imageUrl: string | null;
}

export async function generatePost(): Promise<GeneratedPost> {
  const index = Math.floor(Math.random() * POST_TYPES.length);
  const postType = POST_TYPES[index];
  const unsplashQuery = UNSPLASH_QUERIES[index];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `Ты — редактор Telegram-канала "Silicon Valley Designer". Канал ведётся дизайнером, который живёт и работает в Кремниевой долине, но посты готовятся с помощью AI на основе реальных знаний об индустрии.

Аудитория: русскоязычные дизайнеры и те, кто интересуется tech — в России, СНГ и за рубежом. Им интересно знать, что происходит в SV раньше, чем это дойдёт до них.

Правила:
— НЕ пиши от первого лица и не придумывай личные истории ("вчера мне сказали", "я лично видел") — это неправда
— Пиши как умный, хорошо информированный наблюдатель: "в SV сейчас...", "компании всё чаще...", "дизайнеры здесь..."
— Коротко и по делу: 80–120 слов
— Конкретика важнее общих слов
— Используй Telegram-форматирование: *жирный*, _курсив_
— Заканчивай коротким вопросом к читателю или неожиданным выводом
— 2–3 эмодзи максимум
— Никаких хэштегов`,
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

  // Fetch a relevant image from Unsplash (no API key needed for this endpoint)
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  let imageUrl: string | null = null;

  if (unsplashAccessKey) {
    try {
      const imgRes = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(unsplashQuery)}&orientation=landscape&client_id=${unsplashAccessKey}`
      );
      const imgData = (await imgRes.json()) as { urls?: { regular: string } };
      imageUrl = imgData.urls?.regular ?? null;
    } catch {
      // Image is optional — continue without it
    }
  }

  return { text: block.text, imageUrl };
}
