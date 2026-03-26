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
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Find your photos</h1>
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">
            Event: <code className="text-slate-100">{params.eventId}</code>
          </span>
        </div>
        <p className="text-sm text-slate-200">
          Upload a selfie. We’ll search this event and show the closest matches.
        </p>
      </header>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 bg-white/5 px-5 py-4">
          <div className="text-sm font-semibold text-white">Selfie upload</div>
          <div className="mt-1 text-xs text-slate-300">
            Use a clear, front-facing photo for best results.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Choose an image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-white/15"
              />
              <div className="mt-2 text-xs text-slate-400">
                API: <code className="text-slate-200">{apiBase}</code>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="inline-flex h-[42px] items-center justify-center rounded-xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 ring-1 ring-white/10 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search photos"}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </form>
      </section>

      {results.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-100">Matches</h2>
            <div className="text-xs text-slate-300">{results.length} results</div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {results.map((item) => (
              <figure
                key={item.photo.id}
                className="glass overflow-hidden rounded-2xl"
              >
                {item.photo.public_url ? (
                  <img
                    src={item.photo.public_url}
                    alt="Match"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center text-xs text-slate-400">
                    No image URL
                  </div>
                )}
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-slate-300">
                  <span className="truncate">Photo #{item.photo.id}</span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-200 ring-1 ring-white/10">
                    {(item.similarity * 100).toFixed(1)}%
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

