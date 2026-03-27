"use client";

import { useState } from "react";
import type { ProductPayload } from "@/types/product";

type Props = {
  product: ProductPayload;
};

export function ProductCard({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buyNow() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: product.sku,
          name: product.name,
          priceUsd: product.priceUsd,
          imageUrl: product.imageUrl,
          quantity: 1,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError("No redirect URL returned");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.priceUsd);

  return (
    <article
      className="mt-3 max-w-sm overflow-hidden rounded-[6px] border border-spectrum-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
      aria-label={`Product: ${product.name}`}
    >
      <div className="aspect-[4/3] w-full bg-spectrum-gray-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-spectrum-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="border-t border-spectrum-gray-200 p-4">
        <h3 className="text-lg font-semibold leading-snug text-spectrum-gray-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-spectrum-gray-600">
          {product.description}
        </p>
        <p className="mt-3 text-xs uppercase tracking-wide text-spectrum-gray-500">
          SKU · {product.sku}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xl font-semibold text-spectrum-gray-900">
            {formatted}
          </span>
          <button
            type="button"
            onClick={buyNow}
            disabled={loading}
            className="inline-flex min-h-9 min-w-[7.5rem] items-center justify-center rounded-[6px] bg-spectrum-blue-600 px-4 text-sm font-semibold text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition hover:bg-spectrum-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spectrum-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Opening…" : "Buy now"}
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
