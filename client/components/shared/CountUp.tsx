"use client";
import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  separator?: string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  separator = "",
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  function fmt(n: number) {
    const s = Math.round(n).toString();
    if (!separator) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = fmt(from);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();

        const start = performance.now();
        const ms = duration * 1000;

        function tick(now: number) {
          const progress = Math.min((now - start) / ms, 1);
          el!.textContent = fmt(from + (to - from) * easeOutExpo(progress));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, duration, separator]);

  return <span className={className} ref={ref} />;
}