import { lazy, Suspense, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";

const PrivyClientEntry = lazy(() => import("./privy-client-entry"));

export function PrivyRoot({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="p-6 text-sm text-muted-foreground">Loading wallet…</div>}>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading wallet…</div>}>
        <PrivyClientEntry>{children}</PrivyClientEntry>
      </Suspense>
    </ClientOnly>
  );
}
