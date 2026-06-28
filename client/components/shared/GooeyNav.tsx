"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GooeyNavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  activeIndex: number;
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
}

export default function GooeyNav({
  items,
  activeIndex,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}: GooeyNavProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const [internalIndex, setInternalIndex] = useState(activeIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number) => {
    return {
      start: getXY(particleDistances[0], particleCount - i, particleCount),
      end: getXY(particleDistances[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: noise(30),
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t);

      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");

        particle.classList.add("particle");

        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--color-accent-500, #2563eb)`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);

        point.classList.add("point");
        particle.appendChild(point);

        element.appendChild(particle);

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);

    textRef.current.innerText = element.innerText;
  };

  const triggerEffect = (liEl: HTMLElement, index: number) => {
    setInternalIndex(index);
    updateEffectPosition(liEl);

    if (filterRef.current) {
      filterRef.current.querySelectorAll(".particle").forEach((p) =>
        filterRef.current!.removeChild(p)
      );
    }

    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }

    if (filterRef.current) makeParticles(filterRef.current);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, href: string) => {
    e.preventDefault();
    if (internalIndex !== index) {
      triggerEffect(e.currentTarget.parentElement as HTMLElement, index);
    }
    router.push(href);
  };

  useEffect(() => {
    setInternalIndex(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (!navRef.current) return;
    const activeLi = navRef.current.querySelectorAll("li")[internalIndex] as HTMLElement;
    if (activeLi) updateEffectPosition(activeLi);
  }, [internalIndex]);

  return (
    <>
      <style>{`
        .gooey-nav-wrap {
          --color-accent-500: #2563eb;
        }

        .gooey-nav-wrap .effect {
          position: absolute;
          pointer-events: none;
          display: grid;
          place-items: center;
        }

        .gooey-nav-wrap .effect.text {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .gooey-nav-wrap .effect.text.active {
          color: #2563eb; /* BLUE ONLY */
        }

        .gooey-nav-wrap .effect.filter {
          filter: blur(6px) contrast(90);
          mix-blend-mode: normal; /* FIX: removed harsh blending */
        }

        .gooey-nav-wrap .particle,
        .gooey-nav-wrap .point {
          display: block;
          opacity: 0;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
        }

        .gooey-nav-wrap .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          animation: gooey-particle var(--time) ease forwards;
        }

        .gooey-nav-wrap .point {
          background: var(--color);
          opacity: 1;
          animation: gooey-point var(--time) ease forwards;
        }

        @keyframes gooey-particle {
          0% { transform: translate(var(--start-x), var(--start-y)); opacity: 1; }
          100% { transform: translate(var(--end-x), var(--end-y)); opacity: 0; }
        }

        @keyframes gooey-point {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(var(--scale)); opacity: 0; }
        }

        .gooey-nav-wrap li.active > a {
          color: #2563eb; /* BLUE ACTIVE TEXT */
        }
      `}</style>

      <div className="gooey-nav-wrap relative" ref={containerRef}>
        <nav className="flex relative">
          <ul ref={navRef} className="flex gap-1 relative z-10">
            {items.map((item, index) => (
              <li key={item.href} className={internalIndex === index ? "active" : ""}>
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, index, item.href)}
                  className="px-3.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
}