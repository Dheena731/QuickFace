import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm md:grid-cols-5 md:p-10">
        <div className="md:col-span-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Deliver event photos instantly — with one selfie.
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-slate-600 md:text-base">
            QuickFace is a self-hostable platform for photographers and studios. Guests upload a
            selfie and get their matching photos from your gallery in seconds.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/events/demo/search" className="btn-primary">
              Try guest demo
            </Link>
            <Link href="/dashboard/events" className="btn-secondary">
              Open studio dashboard
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
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
              <div className="text-sm font-semibold text-slate-900">How it works</div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs text-white">
                    1
                  </span>
                  <span>Create an event and upload your photos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs text-white">
                    2
                  </span>
                  <span>Share one link or QR with guests.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs text-white">
                    3
                  </span>
                  <span>Guests upload a selfie and instantly get matches.</span>
                </li>
              </ol>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                Tip: set <code className="text-slate-900">NEXT_PUBLIC_API_BASE</code> to point the
                UI at your backend.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Guest flow</div>
            <span className="status-chip">Fast path</span>
          </div>
          <ol className="space-y-2 text-sm text-slate-600">
            <li>1. Open event link</li>
            <li>2. Upload selfie</li>
            <li>3. View matching photos</li>
          </ol>
          <Link href="/events/demo/search" className="btn-secondary mt-4">
            Start guest flow
          </Link>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Studio flow</div>
            <span className="status-chip">Guided setup</span>
          </div>
          <ol className="space-y-2 text-sm text-slate-600">
            <li>1. Create event</li>
            <li>2. Upload gallery via API</li>
            <li>3. Share guest link / QR</li>
          </ol>
          <Link href="/dashboard/events" className="btn-secondary mt-4">
            Start studio flow
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-slate-900">Guest experience</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No accounts. No scrolling through thousands of images. Guests simply upload a selfie to
            find their photos.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-slate-900">Studio workflow</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload once, share one link. Background workers process photos and build embeddings
            automatically.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm font-semibold text-slate-900">Self-hostable</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Run it on your own infrastructure with Docker Compose (Postgres + pgvector, Redis,
            MinIO).
          </p>
        </div>
      </section>
    </div>
  );
}

