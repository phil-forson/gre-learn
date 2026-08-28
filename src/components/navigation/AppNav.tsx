"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeQuickToggle } from "@/components/theme/ThemeQuickToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/audio", label: "Audio Review" },
  { href: "/favorites", label: "Favorites" },
  { href: "/path", label: "English Path" },
  { href: "/piano", label: "Piano" },
  { href: "/settings", label: "Settings" },
];

function isPathChrome(pathname: string): boolean {
  return (
    pathname.startsWith("/path") ||
    pathname.startsWith("/grammar") ||
    pathname.startsWith("/sentence") ||
    pathname.startsWith("/speaking")
  );
}

function isPianoChrome(pathname: string): boolean {
  return pathname.startsWith("/piano");
}

export function AppNav() {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/audio") && pathname !== "/audio";
  const pathChrome = isPathChrome(pathname);
  const pianoChrome = isPianoChrome(pathname);

  if (hideChrome) return null;

  const eyebrow = pianoChrome
    ? "Practice"
    : pathChrome
      ? "American English"
      : "GRE prep";
  const brandHref = pianoChrome ? "/piano" : pathChrome ? "/path" : "/";
  const brandTitle = pianoChrome
    ? "Piano path"
    : pathChrome
      ? "Learning path"
      : "GRE Learn";

  return (
    <header className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-ui)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            {eyebrow}
          </p>
          <Link
            href={brandHref}
            className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl"
          >
            {brandTitle}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeQuickToggle />
          {!pathChrome && !pianoChrome ? (
            <Link
              href="/audio"
              className="hidden rounded-full bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--on-accent)] sm:inline-flex"
            >
              Start review
            </Link>
          ) : null}
        </div>
      </div>
      <nav
        aria-label="Primary"
        className="mt-5 -mx-1 flex gap-1 overflow-x-auto overscroll-x-contain pb-1 font-[family-name:var(--font-ui)] text-sm [-webkit-overflow-scrolling:touch]"
      >
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : link.href === "/path"
                ? pathname.startsWith("/path") ||
                  pathname.startsWith("/grammar") ||
                  pathname.startsWith("/sentence") ||
                  pathname.startsWith("/speaking")
                : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex min-h-11 touch-manipulation select-none items-center whitespace-nowrap rounded-full px-3 py-2 transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "text-[var(--ink-muted)] active:bg-[var(--overlay)] active:text-[var(--ink)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--overlay)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
