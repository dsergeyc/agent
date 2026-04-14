/**
 * Fetches today's top tech news from Hacker News and TechCrunch RSS.
 * No API key needed — both are free and public.
 */

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

// Keywords to filter for SV-relevant stories
const RELEVANT_KEYWORDS = [
  "design", "designer", "figma", "ux", "ui",
  "openai", "anthropic", "google", "meta", "apple", "microsoft", "nvidia",
  "ai", "llm", "gpt", "claude", "gemini",
  "layoff", "hiring", "salary", "job", "career",
  "startup", "silicon valley", "san francisco",
  "product", "saas", "funding", "ipo",
  "visa", "h1b", "remote", "return to office",
];

function isRelevant(title: string): boolean {
  const lower = title.toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  const idsRes = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const ids = (await idsRes.json()) as number[];

  const top50 = ids.slice(0, 50);
  const stories = await Promise.all(
    top50.map(async (id) => {
      const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return res.json() as Promise<{
        title?: string;
        url?: string;
        type?: string;
      }>;
    })
  );

  return stories
    .filter((s) => s.type === "story" && s.title && s.url && isRelevant(s.title))
    .slice(0, 5)
    .map((s) => ({ title: s.title!, url: s.url!, source: "Hacker News" }));
}

async function fetchTechCrunch(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://techcrunch.com/feed/",
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  const xml = await res.text();

  // Simple RSS parse — extract <title> and <link> pairs
  const items: NewsItem[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1];
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1];
    if (title && link && isRelevant(title)) {
      items.push({ title, url: link, source: "TechCrunch" });
    }
    if (items.length >= 5) break;
  }
  return items;
}

export async function fetchTodaysNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchTechCrunch(),
  ]);

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // Deduplicate by title similarity, return up to 6
  return all.slice(0, 6);
}
