import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "QuickFace",
  description: "AI-powered event photo delivery",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-50 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4">
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400/90 to-indigo-400/90 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/20 ring-1 ring-white/10">
                QF
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-white">
                  QuickFace
                </div>
                <div className="text-xs text-slate-400">AI-powered event photo delivery</div>
              </div>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/events/demo/search"
                className="rounded-lg px-3 py-2 text-slate-200 hover:bg-white/5 hover:text-white"
              >
                Guest demo
              </Link>
              <Link
                href="/dashboard/events"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
              >
                Dashboard
              </Link>
            </nav>
          </header>

          <main className="flex-1 pb-10">{children}</main>

          <footer className="py-8 text-xs text-slate-400">
            <div className="flex flex-col gap-2 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <p>QuickFace — self-hostable, privacy-first photo delivery.</p>
              <p className="text-slate-500">Built with Next.js + FastAPI + pgvector.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

