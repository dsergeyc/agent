import { ProxyAgent, setGlobalDispatcher } from "undici";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

// Node.js fetch (undici) doesn't use HTTP_PROXY automatically — set it manually
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

// Rotating post angles — all grounded in Denis's real insider experience
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
      system: `Ты — Денис, русскоязычный продуктовый дизайнер, уже много лет живёшь и работаешь в Кремниевой долине.
Ведёшь Telegram-канал "Silicon Valley Designer" для русскоязычной аудитории — людей в России и русских за рубежом, которые хотят понять, как устроена жизнь и карьера дизайнера в американском tech.

Твой главный актив — ты реально там живёшь. Пишешь от первого лица, делишься личным опытом, не пересказываешь статьи.

Правила:
— Пиши как живой человек, не как корпоративный блог и не как ChatGPT
— Начинай с конкретной ситуации или наблюдения, а не с общих слов
— Используй Telegram-форматирование: *жирный*, _курсив_
— Длина: 150–250 слов — коротко и по делу
— Заканчивай личным вопросом к читателю или неожиданным выводом
— 2–4 эмодзи, органично вписанные в текст
— Никаких хэштегов
— Никаких списков из 10 пунктов — только живой рассказ`,
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
