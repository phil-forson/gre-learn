"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/audio", label: "Audio Review" },
  { href: "/favorites", label: "Favorites" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/audio") && pathname !== "/audio";

  if (hideChrome) return null;

  return (
    <header className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-ui)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            GRE prep
          </p>
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl"
          >
            GRE Learn
          </Link>
        </div>
        <Link
          href="/audio"
          className="hidden rounded-full bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[#fffdf9] sm:inline-flex"
        >
          Start review
        </Link>
      </div>
      <nav
        aria-label="Primary"
        className="mt-5 -mx-1 flex gap-1 overflow-x-auto pb-1 font-[family-name:var(--font-ui)] text-sm"
      >
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]"
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
