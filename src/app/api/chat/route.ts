import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";

export const maxDuration = 60;

/** Claude Sonnet — strong default for tool use + chat. */
const MODEL = "claude-sonnet-4-20250514";

const system = `You are a concise, helpful shopping assistant for a conversational storefront.
When the user clearly wants a specific product or is ready to buy, call the tool showProduct once with realistic catalog details (name, description, price in USD, SKU, optional image URL).
Use HTTPS image URLs when possible (e.g. product photos from reputable CDNs). Do not invent checkout URLs; the UI will handle payment.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return Response.json(
      {
        error:
          "Missing ANTHROPIC_API_KEY. Create .env.local in the project root, add ANTHROPIC_API_KEY=sk-ant-..., then stop and restart npm run dev.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: anthropic(MODEL),
    system,
    messages: await convertToModelMessages(body.messages),
    stopWhen: stepCountIs(5),
    tools: {
      showProduct: {
        description:
          "Render a product card in the chat when the user wants to purchase or has chosen a specific product.",
        inputSchema: z.object({
          name: z.string(),
          description: z.string(),
          priceUsd: z.number().describe("Price in USD, e.g. 49.99"),
          sku: z.string(),
          imageUrl: z.string().url().optional(),
        }),
        execute: async (input) => input,
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
