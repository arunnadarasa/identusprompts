import type { ReactNode } from "react";

export function SlideLayout({
  kicker,
  footer = "Hyperledger Identus Community Call",
  page,
  total,
  children,
  bare = false,
}: {
  kicker?: string;
  footer?: string;
  page?: number;
  total?: number;
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <div className="slide-content bg-background text-foreground">
      <div className="absolute inset-0 gold-bloom" />
      <div className="absolute inset-0 flex flex-col px-[120px] py-[64px]">
        {!bare && (
          <header className="flex h-[70px] shrink-0 items-center justify-between">
            <span className="slide-kicker text-primary">{kicker ?? "Identus"}</span>
            <span className="slide-badge border border-border px-5 py-2 uppercase tracking-[0.28em] text-muted-foreground">
              identuscatalyst
            </span>
          </header>
        )}
        <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
        {!bare && (
          <footer className="flex h-[60px] shrink-0 items-end justify-between text-muted-foreground">
            <span className="slide-footer">{footer}</span>
            {page && total ? (
              <span className="slide-page">
                {page} / {total}
              </span>
            ) : null}
          </footer>
        )}
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
  accent = false,
}: {
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[260px] flex-1 flex-col gap-4 border p-8 ${
        accent ? "border-primary/60 bg-card" : "border-border bg-card/60"
      }`}
    >
      <h3 className="slide-subtitle font-display text-primary">{title}</h3>
      <div className="slide-body text-muted-foreground">{children}</div>
    </div>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-10 flex flex-col gap-6">
      {items.map((item, i) => (
        <li key={i} className="slide-body-lg flex gap-6 text-foreground">
          <span className="text-primary">—</span>
          <span className="max-w-[1350px]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h2 className="slide-title font-display text-foreground">{children}</h2>;
}
