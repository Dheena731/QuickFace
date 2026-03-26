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
      <body className="min-h-screen text-slate-800 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4">
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-sky-300 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
                QF
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-slate-700">
                  QuickFace
                </div>
                <div className="text-xs text-slate-500">AI-powered event photo delivery</div>
              </div>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/events/demo/search"
                className="rounded-lg px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-900"
              >
                Guest demo
              </Link>
              <Link
                href="/dashboard/events"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </nav>
          </header>

          <main className="flex-1 pb-10">{children}</main>

          <footer className="py-8 text-xs text-slate-500">
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
              <p>QuickFace — self-hostable, privacy-first photo delivery.</p>
              <p className="text-slate-400">Built with Next.js + FastAPI + pgvector.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

