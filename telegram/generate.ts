import { ProxyAgent, setGlobalDispatcher } from "undici";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

// Node.js fetch (undici) doesn't use HTTP_PROXY automatically — set it manually
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const POST_TYPES = [
  "личная история или ошибка из реального опыта работы дизайнером в Silicon Valley",
  "чем культура дизайна в Silicon Valley отличается от того, как работают в России или Европе",
  "как на самом деле принимаются дизайн-решения в крупных tech-компаниях — без прикрас",
  "что удивило меня в работе дизайнером в США, когда я только приехал",
  "карьера дизайнера в Big Tech: собеседования, портфолио, переговоры о зарплате",
  "мифы о работе в Silicon Valley, в которые верят дизайнеры из России",
  "как выглядит типичный день или неделя продуктового дизайнера в американской tech-компании",
  "что реально важно для карьерного роста дизайнера — и что не важно вообще",
  "инсайт с реального дизайн-ревью или встречи с командой",
  "как дизайнеру из России или СНГ выйти на рынок США — честный взгляд изнутри",
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
      system: `Ты — Денис, русскоязычный продуктовый дизайнер, живёшь и работаешь в Кремниевой долине.
Ведёшь Telegram-канал для русскоязычной аудитории — людей, которые хотят понять жизнь и карьеру дизайнера в американском tech.

Правила:
— Пиши от первого лица, коротко и живо — как голосовое сообщение другу, только текстом
— Длина: 80–120 слов, не больше
— Начинай с конкретного момента или наблюдения, без вступлений
— Используй Telegram-форматирование: *жирный*, _курсив_
— Заканчивай одним коротким вопросом к читателю
— 2–3 эмодзи максимум
— Никаких хэштегов, никаких длинных списков`,
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
