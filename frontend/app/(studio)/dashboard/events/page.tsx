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
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-slate-300">
          Create events and share their QR or search links with guests.
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center"
      >
        <input
          type="text"
          placeholder="Wedding of Alex & Priya"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create event"}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {events.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-200">Recently created</h2>
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium text-slate-100">{ev.name}</div>
                  <div className="text-xs text-slate-400">ID: {ev.id}</div>
                </div>
                <div className="text-xs text-slate-300">
                  Guest link: <code>/events/{ev.id}/search</code>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

