import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;

export function MermaidDiagram({ chart, className = "" }: { chart: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "DM Sans, sans-serif",
      });
      initialized = true;
    }
  }, []);

  useEffect(() => {
    if (!ref.current || !chart?.trim()) return;
    setError(null);
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, chart.trim())
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        }
      })
      .catch(() => {
        setError("Invalid diagram syntax. Please check your Mermaid code.");
      });
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return <div ref={ref} className={`overflow-x-auto ${className}`} />;
}
