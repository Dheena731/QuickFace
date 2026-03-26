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
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

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

  async function copyGuestLink(eventId: string) {
    const link = `${window.location.origin}/events/${eventId}/search`;
    await navigator.clipboard.writeText(link);
    setCopiedEventId(eventId);
    window.setTimeout(() => setCopiedEventId(null), 1600);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Events</h1>
          <p className="text-sm text-slate-600">
            Create an event, then share a single link for guests to find their photos.
          </p>
        </div>
        <div className="glass w-fit rounded-xl px-3 py-2 text-xs text-slate-600">
          API: <code className="text-slate-900">{apiBase}</code>
        </div>
      </header>

      <section className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Create event</h2>
          <span className="status-chip">Step 1 of 3</span>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Event name</label>
            <input
              type="text"
              placeholder="Wedding of Alex & Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="btn-primary mt-5 h-[42px] md:mt-0"
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

      <section className="grid gap-3 md:grid-cols-3">
        <article className="glass rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Step 1</h3>
            <span className="status-chip">Create event</span>
          </div>
          <p className="text-sm text-slate-600">Create an event name that guests can identify easily.</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Step 2</h3>
            <span className="status-chip">Upload photos</span>
          </div>
          <p className="text-sm text-slate-600">
            Upload event photos through <code className="text-slate-800">/api/v1/upload/&lt;event_id&gt;</code>.
          </p>
        </article>
        <article className="glass rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Step 3</h3>
            <span className="status-chip">Share</span>
          </div>
          <p className="text-sm text-slate-600">Share the guest search link or QR with attendees.</p>
        </article>
      </section>

      {events.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Recently created</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {events.map((ev) => (
              <li key={ev.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{ev.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      ID: <code className="text-slate-700">{ev.id}</code>
                    </div>
                  </div>
                  <span className="status-chip">
                    {ev.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div>
                    Guest link{" "}
                    <span className="rounded-md bg-slate-100 px-2 py-1 ring-1 ring-slate-200">
                      <code className="text-slate-800">/events/{ev.id}/search</code>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyGuestLink(ev.id)}
                    className="btn-secondary w-full py-2 text-xs"
                  >
                    {copiedEventId === ev.id ? "Copied" : "Copy guest link"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="glass rounded-2xl p-6 text-sm text-slate-600">
          No events yet. Create one to generate a guest search link.
        </section>
      )}
    </div>
  );
}

