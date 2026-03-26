"use client";

import { FormEvent, useEffect, useState } from "react";

type Event = {
  id: string;
  name: string;
  slug?: string | null;
  status: string;
  created_at: string;
};

export default function EventsDashboardPage() {
  const [name, setName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/v1/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const data = await res.json();
      setEvents((prev) => [data, ...prev]);
      setName("");
    } catch (err: any) {
      setError(err.message ?? "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // For now, dashboard only shows events created in this session.
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Events</h1>
          <p className="text-sm text-slate-200">
            Create an event, then share a single link for guests to find their photos.
          </p>
        </div>
        <div className="glass w-fit rounded-xl px-3 py-2 text-xs text-slate-200">
          API: <code className="text-slate-100">{apiBase}</code>
        </div>
      </header>

      <section className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Create event</h2>
          <span className="text-xs text-slate-400">Guests will use selfie search</span>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-300">Event name</label>
            <input
              type="text"
              placeholder="Wedding of Alex & Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="mt-5 inline-flex h-[42px] items-center justify-center rounded-xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 ring-1 ring-white/10 hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0"
          >
            {loading ? "Creating..." : "Create event"}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </section>

      {events.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Recently created</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {events.map((ev) => (
              <li key={ev.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{ev.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      ID: <code className="text-slate-200">{ev.id}</code>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                    {ev.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-300">
                  Guest link{" "}
                  <span className="rounded-md bg-slate-950/40 px-2 py-1 ring-1 ring-white/10">
                    <code className="text-slate-100">/events/{ev.id}/search</code>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="glass rounded-2xl p-6 text-sm text-slate-200">
          No events yet. Create one to generate a guest search link.
        </section>
      )}
    </div>
  );
}

