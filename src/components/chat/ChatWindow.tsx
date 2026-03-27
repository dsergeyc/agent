"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState, type ReactNode } from "react";
import { MessageBubble } from "./MessageBubble";

function friendlyChatError(raw: string | undefined): {
  title: string;
  detail: ReactNode;
} {
  if (!raw?.trim()) {
    return {
      title: "Could not reach the assistant",
      detail:
        "Check ANTHROPIC_API_KEY in .env.local and restart npm run dev.",
    };
  }

  const quotaOpenAI =
    raw.includes("insufficient_quota") ||
    raw.includes("exceeded your current quota");
  const quotaAnthropic =
    raw.includes("credit balance") ||
    raw.includes("Plans & Billing") ||
    raw.includes("purchase credits");

  if (quotaOpenAI) {
    return {
      title: "OpenAI: no API credits",
      detail: (
        <>
          Your key is working, but this OpenAI account has{" "}
          <strong>no credits or billing</strong> set up. Open{" "}
          <a
            href="https://platform.openai.com/account/billing"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            platform.openai.com → Billing
          </a>
          , add a payment method or credits, then try again.
        </>
      ),
    };
  }

  if (quotaAnthropic) {
    return {
      title: "Anthropic: billing or credits",
      detail: (
        <>
          Your Anthropic key may be valid, but the account needs{" "}
          <strong>available credits or billing</strong>. Open{" "}
          <a
            href="https://console.anthropic.com/settings/billing"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            console.anthropic.com → Billing
          </a>
          , add credits or a payment method, then try again.
        </>
      ),
    };
  }

  return { title: "Could not reach the assistant", detail: raw };
}

export function ChatWindow() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const busy = status === "streaming" || status === "submitted";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col rounded-[6px] border border-spectrum-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <header className="flex items-center gap-3 border-b border-spectrum-gray-200 bg-spectrum-gray-50 px-5 py-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-spectrum-blue-600 text-sm font-bold text-white"
          aria-hidden
        >
          CC
        </div>
        <div>
          <h1 className="text-base font-semibold text-spectrum-gray-900">
            Shop assistant
          </h1>
          <p className="text-sm text-spectrum-gray-600">
            Spectrum-style conversational commerce
          </p>
        </div>
      </header>

      <div
        className="flex min-h-[min(60vh,520px)] flex-col gap-4 overflow-y-auto bg-spectrum-gray-75 px-4 py-5 sm:px-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {error ? (
          <div
            className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {(() => {
              const { title, detail } = friendlyChatError(error.message);
              return (
                <>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-red-800">{detail}</p>
                </>
              );
            })()}
          </div>
        ) : null}
        {messages.length === 0 ? (
          <div className="mx-auto max-w-md rounded-[6px] border border-dashed border-spectrum-gray-300 bg-white px-4 py-6 text-center text-sm text-spectrum-gray-600">
            Ask for a product—for example: “I want wireless headphones under
            $150”—and the assistant can surface a{" "}
            <span className="font-medium text-spectrum-gray-800">
              product card
            </span>{" "}
            with Buy now (Stripe Checkout).
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <form
        className="border-t border-spectrum-gray-200 bg-white p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          void sendMessage({ text });
          setInput("");
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id="chat-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to buy…"
            className="min-h-[3rem] w-full resize-y rounded-[6px] border border-spectrum-gray-300 bg-white px-3 py-2 text-[15px] text-spectrum-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-spectrum-gray-500 focus:border-spectrum-blue-500 focus:outline-none focus:ring-2 focus:ring-spectrum-blue-400/40"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[6px] bg-spectrum-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-spectrum-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spectrum-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
        <p className="mt-2 text-xs text-spectrum-gray-500">
          <span className="font-medium text-spectrum-gray-700">Chat:</span> add{" "}
          <code className="rounded bg-spectrum-gray-100 px-1 py-0.5 text-[11px]">
            ANTHROPIC_API_KEY
          </code>{" "}
          to{" "}
          <code className="rounded bg-spectrum-gray-100 px-1 py-0.5 text-[11px]">
            .env.local
          </code>{" "}
          and restart{" "}
          <code className="rounded bg-spectrum-gray-100 px-1 py-0.5 text-[11px]">
            npm run dev
          </code>
          .{" "}
          <span className="font-medium text-spectrum-gray-700">Buy now:</span>{" "}
          also set{" "}
          <code className="rounded bg-spectrum-gray-100 px-1 py-0.5 text-[11px]">
            STRIPE_SECRET_KEY
          </code>{" "}
          (optional for chatting only).
        </p>
      </form>
    </div>
  );
}
