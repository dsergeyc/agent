"use client";

import type { UIMessage } from "ai";
import { ProductCard } from "./ProductCard";
import type { ProductPayload } from "@/types/product";

function textFromUserMessage(message: UIMessage): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function MessageBubble({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    const text = textFromUserMessage(message);
    return (
      <div className="flex justify-end">
        <div className="max-w-[min(100%,42rem)] rounded-[6px] bg-spectrum-blue-600 px-4 py-3 text-[15px] leading-relaxed text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {text}
        </div>
      </div>
    );
  }

  if (message.role !== "assistant") {
    return null;
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[min(100%,42rem)] space-y-2 rounded-[6px] border border-spectrum-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-spectrum-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {message.parts?.map((part, index) => {
          if (part.type === "text") {
            return (
              <p key={index} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }

          if (part.type === "tool-showProduct") {
            const callId = part.toolCallId;
            switch (part.state) {
              case "input-streaming":
                return (
                  <p key={callId} className="text-sm text-spectrum-gray-500">
                    Preparing product…
                  </p>
                );
              case "input-available":
                return (
                  <p key={callId} className="text-sm text-spectrum-gray-500">
                    Loading product…
                  </p>
                );
              case "output-available": {
                const product = part.output as ProductPayload;
                return <ProductCard key={callId} product={product} />;
              }
              case "output-error":
                return (
                  <p key={callId} className="text-sm text-red-600">
                    {part.errorText ?? "Could not load product."}
                  </p>
                );
              default:
                return null;
            }
          }

          return null;
        })}
      </div>
    </div>
  );
}
