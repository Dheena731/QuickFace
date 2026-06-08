import Link from "next/link";
import { LogoFull, LogoMark } from "./components/Logo";

const TICKER_ITEMS = [
  "pgvector similarity search",
  "face-recognition embeddings",
  "Cloudflare R2 storage",
  "Celery async processing",
  "Self-hostable",
  "Open source",
  "Event-isolated data",
  "40%+ similarity threshold",
  "Docker Compose ready",
  "FastAPI + Next.js",
];

// Aperture lens SVG — 6 iris blades forming the camera diaphragm
function ApertureLens({ size = 320 }: { size?: number }) {
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className="animate-spin-slow select-none"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="100" cy="100" r="96"
        stroke="url(#ringGrad)"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Iris blades */}
      {blades.map((angle) => (
        <ellipse
          key={angle}
          cx="100" cy="30"
          rx="18" ry="70"
          fill="#09090f"
          stroke="rgba(99,102,241,0.18)"
          strokeWidth="0.5"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {/* Centre opening glow */}
      <circle cx="100" cy="100" r="22" fill="url(#centreGrad)" opacity="0.5" />
      <circle cx="100" cy="100" r="14" fill="url(#innerGrad)" />
      {/* Tick marks on outer ring */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="100" y1="6"
          x2="100" y2={i % 6 === 0 ? "14" : "11"}
          stroke={i % 6 === 0 ? "rgba(99,102,241,0.6)" : "rgba(99,102,241,0.2)"}
          strokeWidth={i % 6 === 0 ? "1.5" : "0.8"}
          transform={`rotate(${i * 15} 100 100)`}
        />
      ))}
      <defs>
        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
        <radialGradient id="centreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.6" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
           style={{ background: "linear-gradient(to bottom, rgba(9,9,15,0.95) 0%, transparent 100%)" }}>
        <Link href="/">
          <LogoFull size={32} />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/events/demo/search" className="btn-ghost py-2 px-4 text-xs">
            Guest Demo
          </Link>
          <Link href="/dashboard/events" className="btn-iris py-2 px-4 text-xs">
            Studio Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Floating gradient orbs */}
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] animate-blob"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[420px] h-[420px] animate-blob"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px]"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-center">
            {/* Left — copy */}
            <div className="space-y-8">
              {/* Overline */}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-iris" />
                <span className="text-xs font-semibold tracking-[0.2em] text-iris uppercase">
                  AI Photo Delivery
                </span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-[clamp(2.8rem,8vw,6rem)] font-black leading-[0.92] tracking-tight text-snow-bright">
                  YOUR FACE
                </h1>
                <h1 className="text-[clamp(2.8rem,8vw,6rem)] font-black leading-[0.92] tracking-tight">
                  <span className="text-iris-gradient">IS THE KEY.</span>
                </h1>
              </div>

              <p className="max-w-lg text-base leading-relaxed text-ghost-bright">
                Guests upload one selfie. QuickFace searches the entire event gallery
                using facial recognition and delivers every matching photo — instantly,
                no scrolling, no account required.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/events/demo/search" className="btn-iris text-sm px-6 py-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Try Guest Search
                </Link>
                <Link href="/dashboard/events" className="btn-ghost text-sm px-6 py-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Open Studio
                </Link>
              </div>

              {/* Tech badges */}
              <div className="flex flex-wrap gap-2">
                {["pgvector", "face-recognition", "Cloudflare R2", "FastAPI", "Open Source"].map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>

            {/* Right — aperture graphic */}
            <div className="hidden lg:flex flex-col items-center gap-6">
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border border-iris/20 animate-pulse-ring" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border border-iris/10 animate-pulse-ring"
                       style={{ animationDelay: "0.7s" }} />
                </div>
                {/* Aperture lens */}
                <div className="relative animate-float">
                  <ApertureLens size={300} />
                </div>
              </div>
              {/* Floating stat badge */}
              <div className="glass-iris rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl font-black text-iris-gradient">∞</div>
                <div className="text-xs text-ghost-bright mt-0.5">Photos matched per second</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature ticker ──────────────────────────────── */}
      <div className="relative border-y border-ink overflow-hidden py-3"
           style={{ background: "rgba(99,102,241,0.04)" }}>
        <div className="flex animate-ticker whitespace-nowrap select-none">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 text-xs text-ghost font-medium tracking-widest uppercase">
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: i % 2 === 0 ? "#6366f1" : "#f59e0b" }}
              />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-iris" />
              <span className="text-xs font-semibold tracking-[0.2em] text-iris uppercase">How It Works</span>
              <div className="h-px w-8 bg-iris" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-snow">Three steps. Zero friction.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Create Event",
                body: "Studio creates an event in the dashboard and receives a unique event ID.",
                color: "iris",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Upload Photos",
                body: "Batch upload event photos via API. Celery workers extract face embeddings automatically.",
                color: "photo",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Guests Search",
                body: "Guests visit the link, upload a selfie, and instantly see every photo featuring them.",
                color: "iris",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
                  </svg>
                ),
              },
            ].map(({ num, title, body, color, icon }) => (
              <div key={num} className="glass-dark rounded-2xl p-6 relative overflow-hidden group hover:border-iris/30 transition-colors duration-300">
                {/* Step number watermark */}
                <div
                  className="absolute -top-4 -right-2 text-[6rem] font-black leading-none select-none pointer-events-none"
                  style={{ color: color === "iris" ? "rgba(99,102,241,0.06)" : "rgba(245,158,11,0.06)" }}
                >
                  {num}
                </div>
                <div
                  className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: color === "iris"
                      ? "rgba(99,102,241,0.15)"
                      : "rgba(245,158,11,0.15)",
                    color: color === "iris" ? "#818cf8" : "#fcd34d",
                    border: `1px solid ${color === "iris" ? "rgba(99,102,241,0.25)" : "rgba(245,158,11,0.25)"}`,
                  }}
                >
                  {icon}
                </div>
                <div className="relative z-10">
                  <div className="text-xs text-ghost tracking-widest uppercase mb-1">{num}</div>
                  <h3 className="text-base font-bold text-snow mb-2">{title}</h3>
                  <p className="text-sm text-ghost-bright leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For guests vs studios ───────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Guest card */}
          <div className="glass-dark rounded-2xl overflow-hidden group hover:border-iris/30 transition-colors duration-300">
            <div className="px-6 pt-6 pb-4 border-b border-ink">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-snow">For Guests</h3>
                <span className="chip chip-iris">No account needed</span>
              </div>
              <p className="text-xs text-ghost-bright">Find your photos in under 10 seconds.</p>
            </div>
            <div className="p-6 space-y-3">
              {["Open the event link", "Upload a selfie from your phone", "See every photo featuring you", "Download or share your photos"].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-ghost-bright">{step}</span>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/events/demo/search" className="btn-iris w-full justify-center text-sm py-2.5">
                  Try Guest Search
                </Link>
              </div>
            </div>
          </div>

          {/* Studio card */}
          <div className="glass-dark rounded-2xl overflow-hidden group hover:border-photo/30 transition-colors duration-300">
            <div className="px-6 pt-6 pb-4 border-b border-ink">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-snow">For Studios</h3>
                <span className="chip chip-photo">Self-hostable</span>
              </div>
              <p className="text-xs text-ghost-bright">Deploy once. Deliver to every event.</p>
            </div>
            <div className="p-6 space-y-3">
              {["Create event in the dashboard", "Upload photos via API or UI", "Share one guest link or QR", "AI processes and matches faces automatically"].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-ghost-bright">{step}</span>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/events" className="btn-ghost w-full justify-center text-sm py-2.5">
                  Open Studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────── */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 65%)" }}
        />
        <div className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-snow">
            Ready to transform<br />
            <span className="text-iris-gradient">photo delivery?</span>
          </h2>
          <p className="text-ghost-bright">
            Open source. Self-hosted. Zero egress fees on Cloudflare R2.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard/events" className="btn-iris px-8 py-3">
              Get Started Free
            </Link>
            <a
              href="https://github.com"
              className="btn-ghost px-8 py-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-ink px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ghost">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span>QuickFace — privacy-first event photo delivery</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI</span>
            <span className="text-ink-light">·</span>
            <span>pgvector</span>
            <span className="text-ink-light">·</span>
            <span>Cloudflare R2</span>
            <span className="text-ink-light">·</span>
            <span>Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
