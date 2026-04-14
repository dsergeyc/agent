import { ProxyAgent, setGlobalDispatcher } from "undici";
import { fetchTodaysNews } from "../telegram/news";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const POST_TYPES = [
  "зарплаты в Silicon Valley — цифры и тренды",
  "как получить работу в американском Big Tech",
  "как AI меняет работу прямо сейчас в SV",
  "чем культура работы в SV отличается от России/Европы",
  "инсайд: что сейчас происходит в tech-индустрии",
  "мифы о Silicon Valley",
  "карьерный рост в американских tech-компаниях",
  "remote work vs офис — что происходит в SV сейчас",
  "стартап vs Big Tech — реальная разница",
  "визы и переезд в США для tech-специалистов",
];

export async function generateTweet(): Promise<string> {
  const postType = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)];
  const today = new Date().toLocaleDateString("ru-RU", {
    year: "numeric", month: "long", day: "numeric",
  });

  let newsContext = "";
  try {
    const news = await fetchTodaysNews();
    if (news.length > 0) {
      newsContext = "\n\nАктуальные новости сегодня:\n" +
        news.map((n, i) => `${i + 1}. ${n.title} — ${n.url}`).join("\n");
    }
  } catch {
    // Continue without news
  }

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
      system: `Ты — редактор X (Twitter) аккаунта "Silicon Valley Designer". Автор — русскоязычный дизайнер из Кремниевой долины.

Аудитория: русскоязычные tech-специалисты и дизайнеры.

Правила:
— Пиши на русском
— СТРОГО до 270 символов — это жёсткий лимит X
— Короткие рубленые фразы, каждая на новой строке
— Никакого markdown, никаких звёздочек
— 1–2 эмодзи максимум
— Можно 1–2 хэштега в конце (#SiliconValley #дизайн)
— Заканчивай либо провокационным утверждением, либо коротким вопросом
— НЕ придумывай личные истории от первого лица
— Если есть актуальная новость по теме — используй её как основу`,
      messages: [
        {
          role: "user",
          content: `Сегодня ${today}.${newsContext}\n\nНапиши твит на тему: ${postType}`,
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

  // Trim to 280 chars just in case
  return block.text.trim().slice(0, 280);
}
