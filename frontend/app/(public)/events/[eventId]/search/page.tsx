/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogoFull } from "../../../../components/Logo";

type SearchResult = {
  photo: { id: number; event_id: string; public_url?: string | null };
  similarity: number;
};

// Subtle tilts for the polaroid cards
const TILTS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-1.8deg", "0.6deg", "-2.2deg", "1.2deg"];

// Camera iris SVG — 6 overlapping ellipses forming the aperture diaphragm
function IrisBlades({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full transition-all duration-700 ${spinning ? "animate-spin-slow" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="100" cy="30"
          rx="18" ry="70"
          fill="#09090f"
          stroke="rgba(99,102,241,0.14)"
          strokeWidth="0.5"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="20" fill="url(#apertureGlow)" />
      <defs>
        <radialGradient id="apertureGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// The circular aperture upload zone
function ApertureZone({
  onFile,
  previewUrl,
  loading,
}: {
  onFile: (f: File) => void;
  previewUrl: string | null;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Outer pulse rings */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {!loading && (
          <>
            <div className="absolute inset-0 rounded-full border border-iris/20 animate-pulse-ring" />
            <div
              className="absolute inset-0 rounded-full border border-iris/10 animate-pulse-ring"
              style={{ animationDelay: "0.8s" }}
            />
          </>
        )}

        {/* Main aperture ring */}
        <div
          className={`aperture-ring w-64 h-64 cursor-pointer transition-all duration-300 ${
            dragging ? "glow-iris scale-105" : ""
          } ${loading ? "animate-spin-reverse" : ""}`}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden">
            {/* Iris blades */}
            <div className="absolute inset-0">
              <IrisBlades spinning={loading} />
            </div>

            {/* Scan line (visible while loading) */}
            {loading && (
              <div className="absolute inset-3 rounded-full overflow-hidden pointer-events-none">
                <div
                  className="absolute left-0 right-0 h-0.5 animate-scanline"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.8) 50%, transparent 100%)",
                    boxShadow: "0 0 12px rgba(99,102,241,0.6)",
                  }}
                />
              </div>
            )}

            {/* Preview image inside aperture circle */}
            {previewUrl && !loading && (
              <div className="absolute inset-3 rounded-full overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Your selfie preview"
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
            )}

            {/* Centre icon / state */}
            <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
              {loading ? (
                <span className="text-xs font-semibold tracking-[0.2em] text-iris-bright uppercase animate-glow-breathe">
                  Developing…
                </span>
              ) : previewUrl ? (
                <span className="text-xs font-semibold tracking-[0.15em] text-ghost-bright uppercase">
                  Shutter ready
                </span>
              ) : (
                <>
                  <svg className="w-8 h-8 text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-ghost uppercase">
                    {dragging ? "Drop here" : "Open Shutter"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      <p className="text-xs text-ghost text-center max-w-[240px] leading-relaxed">
        {loading
          ? "Searching the event gallery for your face…"
          : previewUrl
          ? "Tap the shutter button below to search"
          : "Click the aperture or drag a photo to begin"}
      </p>
    </div>
  );
}

// Polaroid card that "develops" from black
function PolaroidCard({ result, index }: { result: SearchResult; index: number }) {
  const tilt = TILTS[index % TILTS.length];
  const delay = `${index * 0.12}s`;
  const pct = (result.similarity * 100).toFixed(0);
  const quality = result.similarity >= 0.80 ? "chip-iris" : result.similarity >= 0.60 ? "chip-photo" : "chip";

  return (
    <figure
      className="polaroid cursor-pointer"
      style={{"--tilt": tilt, "--delay": delay} as React.CSSProperties}
    >
      {result.photo.public_url ? (
        <img
          src={result.photo.public_url}
          alt={`Match #${result.photo.id}`}
          className="w-full aspect-square object-cover block"
          style={{ minHeight: "160px" }}
        />
      ) : (
        <div
          className="w-full aspect-square flex items-center justify-center text-xs"
          style={{ background: "#1e1e30", color: "#7070a0", minHeight: "160px" }}
        >
          No image
        </div>
      )}
      <figcaption className="pt-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-400">#{result.photo.id}</span>
        <span className={`chip ${quality} text-[10px]`}>{pct}%</span>
      </figcaption>
    </figure>
  );
}

export default function EventSearchPage({ params }: { params: { eventId: string } }) {
  const [file, setFile]       = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  function handleFile(f: File) {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
    setResults(null);
    setSearched(false);
  }

  async function handleSearch() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSearched(false);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${apiBase}/api/v1/search/${params.eventId}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          res.status === 404 ? "Event not found. Check the link." :
          res.status === 413 ? "Image is too large. Try a smaller file." :
          res.status === 429 ? "Too many requests. Wait a moment." :
          data.detail ?? `Search failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setResults(data.results ?? []);
      setSearched(true);
    } catch (err: unknown) {
      const msg =
        err instanceof TypeError && err.message.includes("fetch")
          ? `Cannot reach API at ${apiBase}. Check NEXT_PUBLIC_API_BASE.`
          : err instanceof Error ? err.message : "Search failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
    setSearched(false);
  }

  const hasResults = results !== null && results.length > 0;
  const noMatch    = searched && results !== null && results.length === 0;

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* ── Minimal nav ───────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink">
        <Link href="/">
          <LogoFull size={28} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ghost hidden sm:block">Event</span>
          <span className="chip font-mono">{params.eventId.slice(0, 8)}…</span>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────── */}
      <main className="flex-1 flex flex-col">

        {/* Stage: before any search — aperture centered on screen */}
        {!hasResults && !noMatch && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
            {/* Headline */}
            {!file && (
              <div className="text-center space-y-2 animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-black text-snow">Find your photos.</h1>
                <p className="text-sm text-ghost-bright">Upload a selfie — we do the rest.</p>
              </div>
            )}

            {/* Aperture */}
            <ApertureZone onFile={handleFile} previewUrl={previewUrl} loading={loading} />

            {/* Error state */}
            {error && (
              <div className="glass-dark rounded-2xl px-5 py-3 max-w-sm text-sm text-danger text-center border-danger/20">
                {error}
              </div>
            )}

            {/* CTA: search button appears after file selected */}
            {file && !loading && (
              <div className="flex flex-col items-center gap-3 animate-slide-up">
                <button onClick={handleSearch} className="btn-iris px-10 py-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Open Shutter
                </button>
                <button onClick={reset} className="text-xs text-ghost hover:text-ghost-bright transition-colors">
                  Choose a different photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage: no match found */}
        {noMatch && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
                 style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <svg className="w-9 h-9 text-photo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-snow">No matches found</h2>
              <p className="text-sm text-ghost-bright max-w-xs">
                Try a clearer selfie with good lighting and a front-facing angle.
              </p>
            </div>
            <button onClick={reset} className="btn-ghost px-8 py-2.5">
              Try Again
            </button>
          </div>
        )}

        {/* Stage: results — polaroid developing gallery */}
        {hasResults && (
          <div className="px-4 md:px-8 py-8 animate-fade-in">
            {/* Results header */}
            <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
              <div>
                <h2 className="text-lg font-black text-snow">
                  {results!.length} {results!.length === 1 ? "photo" : "photos"} found
                </h2>
                <p className="text-xs text-ghost mt-0.5">Developing your gallery…</p>
              </div>
              <button onClick={reset} className="btn-ghost py-2 px-4 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                New Search
              </button>
            </div>

            {/* The polaroid grid — intentionally offset/asymmetric */}
            <div
              className="max-w-5xl mx-auto"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "2rem",
                padding: "2rem 0.5rem 4rem",
              }}
            >
              {results!.map((item, i) => (
                <div
                  key={item.photo.id}
                  style={{
                    marginTop: i % 3 === 1 ? "1.5rem" : i % 3 === 2 ? "0.75rem" : "0",
                    opacity: 0,
                    animation: `slide-up 0.6s ease-out ${i * 0.1}s forwards`,
                  }}
                >
                  <a
                    href={item.photo.public_url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PolaroidCard result={item} index={i} />
                  </a>
                </div>
              ))}
            </div>

            {/* Similarity legend */}
            <div className="max-w-5xl mx-auto mt-4 flex flex-wrap items-center gap-3 text-xs text-ghost px-1">
              <span>Match quality:</span>
              <span className="chip chip-iris">≥80% High</span>
              <span className="chip chip-photo">60–79% Good</span>
              <span className="chip">40–59% Low</span>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="px-6 py-4 border-t border-ink text-center">
        <p className="text-xs text-ghost">
          Powered by{" "}
          <Link href="/" className="text-iris-bright hover:underline">QuickFace</Link>
          {" "}· privacy-first photo delivery
        </p>
      </footer>
    </div>
  );
}
