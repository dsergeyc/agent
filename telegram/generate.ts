import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  const { text } = await client.messages
    .create({
      model: "claude-sonnet-4-6",
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
    })
    .then((msg) => {
      const block = msg.content[0];
      if (block.type !== "text") throw new Error("Unexpected response type");
      return { text: block.text };
    });

  return text;
}
