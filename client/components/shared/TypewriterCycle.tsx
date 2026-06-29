"use client";
import { useEffect, useState } from "react";

const WORDS = ["Discover", "Be a part of", "Connect with"];
const TYPE_SPEED = 60;   // ms per char typed
const ERASE_SPEED = 35;  // ms per char erased
const PAUSE_AFTER_TYPE = 1800;  // ms pause after fully typed
const PAUSE_AFTER_ERASE = 300;  // ms pause before typing next

export default function TypewriterCycle({ className = "" }: { className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing" | "waiting">("typing");

  useEffect(() => {
    const target = WORDS[wordIdx];

    if (phase === "typing") {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), TYPE_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("erasing"), PAUSE_AFTER_TYPE);
        return () => clearTimeout(t);
      }
    }

    if (phase === "erasing") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), ERASE_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setWordIdx(i => (i + 1) % WORDS.length);
          setPhase("typing");
        }, PAUSE_AFTER_ERASE);
        return () => clearTimeout(t);
      }
    }
  }, [displayed, phase, wordIdx]);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-[3px] h-[0.85em] bg-accent-500 ml-1 align-middle"
        style={{ animation: "blink 1s step-end infinite" }}
      />
    </span>
  );
}