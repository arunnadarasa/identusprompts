import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0 group">
          <span className="hidden sm:inline font-mono-q text-xs tracking-[0.18em] uppercase text-accent shrink-0">|0⟩+|1⟩</span>
          <span className="font-display text-base sm:text-lg font-semibold truncate">Creative Quantum</span>
          <span className="hidden md:inline text-xs text-muted-foreground font-mono-q shrink-0">/ idea repo</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
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
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-foreground hover:bg-secondary/60 transition shrink-0"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-background border-l border-border p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-display text-base font-semibold">Creative Quantum</span>
            </div>
            <nav className="flex flex-col p-3 gap-1 text-base">
              <MobileLink to="/themes" onClick={close}>Themes</MobileLink>
              <MobileLink to="/strategy" onClick={close}>Strategy</MobileLink>
              <MobileLink to="/quantum-primer" onClick={close}>Quantum primer</MobileLink>
              <MobileLink to="/about" onClick={close}>About</MobileLink>
              <a
                href="https://creativequantum.lovable.app/"
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-2 px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold text-center"
              >
                Hackathon ↗
              </a>
            </nav>
          </SheetContent>
        </Sheet>
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

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
      activeProps={{ className: "px-4 py-3 rounded-md text-foreground bg-secondary" }}
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