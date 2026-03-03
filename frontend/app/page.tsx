import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">QuickFace</h1>
        <p className="text-slate-300">
          Open-source, AI-powered photo delivery for events and studios.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-lg font-semibold">Guests</h2>
          <p className="mb-4 text-sm text-slate-300">
            Scan a QR code or open your event link to find all your photos with a single selfie.
          </p>
          <Link
            href="/events/demo/search"
            className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
          >
            Try demo search
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-lg font-semibold">Photographers & studios</h2>
          <p className="mb-4 text-sm text-slate-300">
            Upload event galleries and share a single link that automatically routes guests to their
            own photos.
          </p>
          <Link
            href="/dashboard/events"
            className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

