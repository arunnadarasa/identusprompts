import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders a fixed 1920x1080 slide scaled to fit its parent container.
 * Parent must be position: relative with overflow hidden.
 */
export function ScaledSlide({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.min(width / 1920, height / 1080));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden">
      <div className="slide-wrapper" style={{ ["--scale" as string]: String(scale) }}>
        {children}
      </div>
    </div>
  );
}
