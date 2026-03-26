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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Find your photos</h1>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
            Event: <code className="text-slate-800">{params.eventId}</code>
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Upload a selfie. We’ll search this event and show the closest matches.
        </p>
        <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
          <div className="glass rounded-xl px-3 py-2">1. Upload a clear selfie</div>
          <div className="glass rounded-xl px-3 py-2">2. We compare faces in this event</div>
          <div className="glass rounded-xl px-3 py-2">3. Open your matched photos</div>
        </div>
      </header>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Selfie upload</div>
          <div className="mt-1 text-xs text-slate-600">
            Use a clear, front-facing photo for best results.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Choose an image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="input-base block w-full file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
              />
              <div className="mt-2 text-xs text-slate-500">
                API: <code className="text-slate-700">{apiBase}</code>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary h-[42px]"
            >
              {loading ? "Searching..." : "Search photos"}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </section>

      {loading && (
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900">Searching your photos...</h2>
          <p className="mt-1 text-sm text-slate-600">
            This may take a few seconds depending on event size.
          </p>
        </section>
      )}

      {results.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Matches</h2>
            <div className="text-xs text-slate-600">{results.length} results</div>
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
                  <span className="truncate text-slate-600">Photo #{item.photo.id}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-slate-200">
                    {(item.similarity * 100).toFixed(1)}%
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && results.length === 0 && (
        <section className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-900">No matches yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Try another selfie with better lighting and a clear front-facing angle.
          </p>
        </section>
      )}
    </div>
  );
}

