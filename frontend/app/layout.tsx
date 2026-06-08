import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "QuickFace — Instant Photo Delivery",
  description: "Upload a selfie. Find every photo of you from the event in seconds.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-snow antialiased">
        {children}
      </body>
    </html>
  );
}
