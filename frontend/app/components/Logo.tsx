/**
 * QuickFace logo mark — face-detection viewfinder aesthetic.
 *
 * The icon is a gradient square with:
 *   • Four corner L-brackets  →  AR face-detection viewfinder
 *   • Two eye dots + mouth arc →  face silhouette
 *   • Horizontal scan-line hint → AI scanning feel
 *
 * Usage:
 *   <LogoMark size={32} />                     — icon only
 *   <LogoFull size={32} />                      — icon + "QuickFace"
 *   <LogoFull size={28} subtitle="Studio" />    — icon + "QuickFace" + sub-line
 */

type LogoMarkProps = {
  size?: number;
  className?: string;
};

type LogoFullProps = LogoMarkProps & {
  subtitle?: string;
};

/** The square icon mark. Works standalone or embedded in LogoFull. */
export function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  const r = size * 0.25; // corner radius = 25% of size
  const sw = Math.max(1, size * 0.055); // stroke width scales with size

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="QuickFace logo"
      role="img"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="qf-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="55%"  stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        {/* Soft inner glow so the face elements pop */}
        <radialGradient id="qf-glow" cx="50%" cy="45%" r="45%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0"   />
        </radialGradient>
      </defs>

      {/* ── Background ─────────────────────────────── */}
      <rect width="32" height="32" rx={r} fill="url(#qf-bg)" />
      <rect width="32" height="32" rx={r} fill="url(#qf-glow)" />

      {/* ── Outer ring hint ────────────────────────── */}
      <circle
        cx="16" cy="16" r="12.5"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.8"
      />

      {/* ── Viewfinder / detection brackets ─────────── */}
      {/* Top-left */}
      <path d="M5 9 L5 5 L9 5"   stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {/* Top-right */}
      <path d="M27 9 L27 5 L23 5" stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom-left */}
      <path d="M5 23 L5 27 L9 27" stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom-right */}
      <path d="M27 23 L27 27 L23 27" stroke="white" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />

      {/* ── AI scan-line hint (subtle) ───────────────── */}
      <line
        x1="9" y1="16" x2="23" y2="16"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.7"
        strokeDasharray="2 2"
      />

      {/* ── Face ────────────────────────────────────── */}
      {/* Eyes */}
      <circle cx="12.5" cy="14" r="1.6" fill="white" />
      <circle cx="19.5" cy="14" r="1.6" fill="white" />

      {/* Mouth — gentle smile arc */}
      <path
        d="M11.5 19.5 Q16 23 20.5 19.5"
        stroke="white"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Icon + "QuickFace" wordmark (+ optional sub-line).
 * Rendered as a flex row — drop straight into any nav.
 */
export function LogoFull({ size = 32, subtitle, className = "" }: LogoFullProps) {
  const titleSize  = Math.round(size * 0.44);  // ≈14px at size=32
  const subSize    = Math.round(size * 0.31);  // ≈10px at size=32
  const gap        = Math.round(size * 0.28);  // ≈9px at size=32

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
    >
      <LogoMark size={size} />
      <span style={{ lineHeight: 1 }}>
        <span
          className="block font-semibold text-snow tracking-tight"
          style={{ fontSize: titleSize }}
        >
          QuickFace
        </span>
        {subtitle && (
          <span
            className="block text-ghost mt-0.5"
            style={{ fontSize: subSize }}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
