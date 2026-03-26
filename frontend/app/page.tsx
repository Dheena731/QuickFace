import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] md:grid-cols-5 md:p-10">
        <div className="md:col-span-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Deliver event photos instantly — with one selfie.
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-slate-200 md:text-base">
            QuickFace is a self-hostable platform for photographers and studios. Guests upload a
            selfie and get their matching photos from your gallery in seconds.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/events/demo/search"
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 ring-1 ring-white/10 hover:bg-sky-300"
            >
              Try guest demo
            </Link>
            <Link
              href="/dashboard/events"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10"
            >
              Open studio dashboard
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="glass rounded-full px-3 py-1">pgvector search</span>
            <span className="glass rounded-full px-3 py-1">S3 / MinIO storage</span>
            <span className="glass rounded-full px-3 py-1">Async processing</span>
            <span className="glass rounded-full px-3 py-1">Event-isolated</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="glass relative h-full overflow-hidden rounded-2xl p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-transparent to-indigo-400/10" />
            <div className="relative space-y-4">
              <div className="text-sm font-semibold text-slate-100">How it works</div>
              <ol className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 text-xs text-slate-100">
                    1
                  </span>
                  <span>Create an event and upload your photos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 text-xs text-slate-100">
                    2
                  </span>
                  <span>Share one link or QR with guests.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 text-xs text-slate-100">
                    3
                  </span>
                  <span>Guests upload a selfie and instantly get matches.</span>
                </li>
              </ol>

              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-xs text-slate-300">
                Tip: set <code className="text-slate-100">NEXT_PUBLIC_API_BASE</code> to point the
                UI at your backend.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-white">Guest experience</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            No accounts. No scrolling through thousands of images. Guests simply upload a selfie to
            find their photos.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-white">Studio workflow</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Upload once, share one link. Background workers process photos and build embeddings
            automatically.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-white">Self-hostable</div>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            Run it on your own infrastructure with Docker Compose (Postgres + pgvector, Redis,
            MinIO).
          </p>
        </div>
      </section>
    </div>
  );
}

