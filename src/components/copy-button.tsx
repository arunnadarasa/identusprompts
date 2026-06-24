import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] tracking-[0.28em] uppercase font-semibold hover:bg-foreground transition-colors duration-500"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}