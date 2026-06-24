import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="font-mono-q text-xs tracking-[0.18em] uppercase text-accent">|0⟩+|1⟩</span>
          <span className="font-display text-lg font-semibold">Creative Quantum</span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono-q">/ idea repo</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/themes">Themes</NavLink>
          <NavLink to="/strategy">Strategy</NavLink>
          <NavLink to="/quantum-primer">Quantum primer</NavLink>
          <NavLink to="/about">About</NavLink>
          <a
            href="https://creativequantum.lovable.app/"
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            Hackathon ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
      activeProps={{ className: "px-3 py-1.5 rounded-md text-foreground bg-secondary" }}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>1,000 ideas · 10 disciplines · built for the Creative Quantum hackathon</span>
        <span className="font-mono-q">Lovable × Quantinuum (Guppy + Selene)</span>
      </div>
    </footer>
  );
}