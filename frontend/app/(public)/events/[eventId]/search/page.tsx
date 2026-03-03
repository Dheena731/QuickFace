/* eslint-disable @next/next/no-img-element */

"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  photo: {
    id: number;
    event_id: string;
    public_url?: string | null;
  };
  similarity: number;
};

export default function EventSearchPage({
  params,
}: {
  params: { eventId: string };
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults([]);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${apiBase}/api/v1/search/${params.eventId}`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err: any) {
      setError(err.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Find your photos</h1>
        <p className="text-sm text-slate-300">
          Upload a selfie to discover all your photos from this event.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-slate-200"
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="inline-flex w-fit items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search photos"}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {results.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            Matches ({results.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {results.map((item) => (
              <figure
                key={item.photo.id}
                className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60"
              >
                {item.photo.public_url ? (
                  <img
                    src={item.photo.public_url}
                    alt="Match"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                    No image URL
                  </div>
                )}
                <figcaption className="px-2 py-1 text-[11px] text-slate-300">
                  Similarity: {(item.similarity * 100).toFixed(1)}%
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

