import { ProxyAgent, setGlobalDispatcher } from "undici";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

// Node.js fetch (undici) doesn't use HTTP_PROXY automatically — set it manually
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const POST_TYPES = [
  // Деньги и карьера
  "зарплаты дизайнеров и продакт-менеджеров в Silicon Valley — цифры, уровни, как растут",
  "как получить работу в американской tech-компании: что реально работает, а что нет",
  "как устроены собеседования в Big Tech (Google, Meta, Apple, Amazon) — процесс, этапы, что спрашивают",
  "карьерный рост в американских tech-компаниях: уровни, промоушены, что нужно чтобы вырасти",
  "что нужно знать про визы и переезд в США для tech-специалистов — H1B, O1, варианты",

  // AI и инструменты
  "как AI меняет работу дизайнеров прямо сейчас — что происходит в индустрии SV",
  "инструменты и тренды, которые набирают популярность в Silicon Valley прямо сейчас",
  "как компании в SV внедряют AI в продукты и рабочие процессы — конкретные примеры",

  // Жизнь и культура
  "как устроена жизнь в Silicon Valley — стоимость, культура, чего не ожидаешь",
  "чем рабочая культура в американских tech-компаниях отличается от России и Европы",
  "политика и tech в Silicon Valley — как это влияет на индустрию и работу",
  "стартап vs Big Tech — в чём реальная разница для сотрудника",
  "remote work в 2025: что происходит в SV, возвращают ли людей в офис и почему",

  // Инсайды и тренды
  "что сейчас активно обсуждают в tech-тусовке Silicon Valley — тренды, споры, настроения",
  "мифы о Silicon Valley и работе в американском tech — что правда, а что нет",
  "как устроен продуктовый дизайн в крупных компаниях — процессы, решения, команды",
  "что происходит в индустрии дизайна и tech прямо сейчас — новости и их смысл",
];

const UNSPLASH_QUERIES = [
  "silicon valley tech office",
  "salary money career",
  "job interview",
  "career growth promotion",
  "usa visa travel",
  "artificial intelligence technology",
  "tech tools productivity",
  "ai product design",
  "san francisco city life",
  "office culture team",
  "politics technology",
  "startup office",
  "remote work laptop",
  "tech industry trends",
  "myths vs reality",
  "product design process",
  "technology news",
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
      system: `Ты — редактор Telegram-канала "Silicon Valley Designer". Канал ведёт русскоязычный дизайнер из Кремниевой долины, посты готовятся с помощью AI.

Аудитория: русскоязычные люди — дизайнеры, продакты, разработчики, те кто просто интересуется tech — в России, СНГ и за рубежом. Они хотят знать, что происходит в Silicon Valley раньше, чем это дойдёт до них. Хотят понять как устроена работа, карьера, жизнь в американском tech.

Правила:
— НЕ пиши от первого лица, не придумывай личные истории — это нечестно
— Пиши как хорошо информированный наблюдатель: "в SV сейчас...", "компании всё чаще...", "по данным...", "те, кто работает в Big Tech, говорят..."
— Используй реальные факты, цифры, названия компаний — конкретика важнее общих слов
— Коротко: 80–120 слов
— Telegram-форматирование: *жирный*, _курсив_
— Заканчивай одним коротким вопросом к читателю
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
