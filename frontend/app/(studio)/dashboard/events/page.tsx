"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LogoFull, LogoMark } from "../../../components/Logo";

type StudioEvent = {
  id: string;
  name: string;
  slug?: string | null;
  status: string;
  created_at: string;
};

// Film frame number on each event card
const FRAME_NUMS = ["01A", "02B", "03A", "04B", "05A", "06B", "07A", "08B", "09A", "10B"];

// Tiny camera shutter icon
function ShutterIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

// Film-frame style event card (contact sheet aesthetic)
function FilmFrameCard({
  event,
  index,
  onCopy,
  copied,
}: {
  event: StudioEvent;
  index: number;
  onCopy: (id: string) => void;
  copied: boolean;
}) {
  const frameNum = FRAME_NUMS[index % FRAME_NUMS.length];
  const statusColor =
    event.status === "active" ? "chip-success" :
    event.status === "archived" ? "chip" :
    "chip-iris";

  return (
    <div
      className="relative overflow-hidden rounded-xl group transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
      style={{
        background: "#0e0e1a",
        border: "1px solid #1e1e30",
        animationDelay: `${index * 0.08}s`,
        opacity: 0,
      }}
    >
      {/* Film perforations strip — top */}
      <div
        className="h-4 flex items-center"
        style={{
          background: "#1e1e30",
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 6px, #09090f 6px, #09090f 14px, transparent 14px, transparent 22px)",
        }}
      />

      {/* Card body */}
      <div className="px-4 py-4">
        {/* Frame number + status row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-ghost tracking-widest">{frameNum}</span>
          <span className={`chip ${statusColor}`}>{event.status}</span>
        </div>

        {/* Event name */}
        <h3 className="text-sm font-bold text-snow truncate mb-1 group-hover:text-iris-bright transition-colors">
          {event.name}
        </h3>

        {/* Event ID */}
        <p className="text-[10px] font-mono text-ghost mb-4 truncate">
          {event.id}
        </p>

        {/* Guest link */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 text-[10px] font-mono text-ghost-bright truncate"
          style={{ background: "#131320", border: "1px solid #1e1e30" }}
        >
          <svg className="w-3 h-3 flex-shrink-0 text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          /events/{event.id.slice(0, 8)}…/search
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(event.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: copied ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.1)",
              border: copied ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(99,102,241,0.2)",
              color: copied ? "#34d399" : "#818cf8",
            }}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>
          <a
            href={`/events/${event.id}/search`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 rounded-lg transition-colors duration-200"
            style={{ background: "#131320", border: "1px solid #1e1e30", color: "#7070a0" }}
            title="Open guest search page"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>

      {/* Film perforations strip — bottom */}
      <div
        className="h-4 flex items-center"
        style={{
          background: "#1e1e30",
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 6px, #09090f 6px, #09090f 14px, transparent 14px, transparent 22px)",
        }}
      />
    </div>
  );
}

// Create event modal
function CreateEventModal({
  onClose,
  onCreate,
  apiBase,
}: {
  onClose: () => void;
  onCreate: (ev: StudioEvent) => void;
  apiBase: string;
}) {
  const [name, setName]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      onCreate(data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(9,9,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
        style={{ background: "#0e0e1a", border: "1px solid #2a2a42", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-snow">New Event</h2>
            <p className="text-xs text-ghost-bright mt-0.5">Create an event to start uploading photos</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ghost hover:text-snow transition-colors"
            style={{ background: "#131320", border: "1px solid #1e1e30" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ghost-bright mb-1.5">Event Name</label>
            <input
              type="text"
              className="input-void"
              placeholder="Wedding of Alex & Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p className="text-[10px] text-ghost mt-1.5">
              This name is shown to guests on the search page.
            </p>
          </div>

          {error && (
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-iris flex-1 py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </span>
              ) : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsDashboardPage() {
  const [events, setEvents]         = useState<StudioEvent[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [copiedId, setCopiedId]     = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  async function copyGuestLink(eventId: string) {
    const link = `${window.location.origin}/events/${eventId}/search`;
    await navigator.clipboard.writeText(link);
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className="w-56 flex-shrink-0 hidden md:flex flex-col min-h-screen"
        style={{ background: "#0a0a14", borderRight: "1px solid #1e1e30" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-ink">
          <Link href="/">
            <LogoFull size={28} subtitle="Studio" />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            {
              label: "Events",
              active: true,
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              ),
            },
            {
              label: "Analytics",
              active: false,
              soon: true,
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
            },
            {
              label: "Settings",
              active: false,
              soon: true,
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
          ].map(({ label, active, soon, icon }) => (
            <button
              key={label}
              disabled={soon}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={{
                background: active ? "rgba(99,102,241,0.12)" : "transparent",
                color: active ? "#818cf8" : soon ? "#3a3a58" : "#7070a0",
                border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                cursor: soon ? "not-allowed" : "pointer",
              }}
            >
              {icon}
              <span>{label}</span>
              {soon && <span className="ml-auto chip text-[9px] py-0">soon</span>}
            </button>
          ))}
        </nav>

        {/* API indicator at bottom */}
        <div className="px-4 py-4 border-t border-ink">
          <div className="text-[9px] text-ghost mb-1 uppercase tracking-wider">API</div>
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-mono"
            style={{ background: "#131320", border: "1px solid #1e1e30", color: "#5a5a75" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#10b981" }}
            />
            localhost:8000
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 min-h-screen flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #1e1e30", background: "rgba(14,14,26,0.6)", backdropFilter: "blur(12px)" }}
        >
          {/* Mobile logo */}
          <div className="md:hidden">
            <Link href="/">
              <LogoMark size={28} />
            </Link>
          </div>

          <div className="hidden md:block">
            <h1 className="text-base font-bold text-snow">Events</h1>
            <p className="text-xs text-ghost">
              {events.length === 0 ? "No events yet" : `${events.length} event${events.length !== 1 ? "s" : ""} this session`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono"
              style={{ background: "#0e0e1a", border: "1px solid #1e1e30", color: "#4a4a68" }}
            >
              {process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-iris py-2 px-4 text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Event
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Empty state */}
          {events.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-6 animate-fade-in">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
              >
                <ShutterIcon className="w-9 h-9 text-iris" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-snow">No events yet</h2>
                <p className="text-sm text-ghost-bright max-w-xs">
                  Create your first event to get a guest search link and start uploading photos.
                </p>
              </div>

              {/* 3-step instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-4">
                {[
                  { step: "01", label: "Create Event", body: "Give it a name" },
                  { step: "02", label: "Upload Photos", body: "Via POST /api/v1/upload/{id}" },
                  { step: "03", label: "Share Link", body: "Guests find their photos" },
                ].map(({ step, label, body }) => (
                  <div
                    key={step}
                    className="rounded-xl p-4 text-left"
                    style={{ background: "#0e0e1a", border: "1px solid #1e1e30" }}
                  >
                    <div className="text-[10px] font-mono text-ghost mb-1 tracking-widest">{step}</div>
                    <div className="text-xs font-semibold text-snow mb-0.5">{label}</div>
                    <div className="text-[10px] text-ghost-bright">{body}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowModal(true)} className="btn-iris px-8 py-3">
                Create First Event
              </button>
            </div>
          )}

          {/* Film contact-sheet grid */}
          {events.length > 0 && (
            <>
              {/* Section label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1" style={{ background: "#1e1e30" }} />
                <span className="text-[10px] font-mono text-ghost tracking-widest uppercase">Contact Sheet</span>
                <div className="h-px flex-1" style={{ background: "#1e1e30" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {events.map((ev, i) => (
                  <FilmFrameCard
                    key={ev.id}
                    event={ev}
                    index={i}
                    onCopy={copyGuestLink}
                    copied={copiedId === ev.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Create event modal ──────────────────────────── */}
      {showModal && (
        <CreateEventModal
          onClose={() => setShowModal(false)}
          onCreate={(ev) => setEvents((prev) => [ev, ...prev])}
          apiBase={apiBase}
        />
      )}
    </div>
  );
}
