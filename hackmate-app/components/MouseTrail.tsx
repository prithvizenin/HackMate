"use client";

import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  size: number;
}

const COLORS = ["#f472b6", "#22d3ee", "#a3e635", "#facc15"];

export default function MouseTrail() {
  const pointsRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: 12,
      };

      pointsRef.current = [...pointsRef.current, newPoint];

      if (pointsRef.current.length > 20) {
        pointsRef.current = pointsRef.current.slice(-20);
      }
    };

    const animate = () => {
      pointsRef.current = pointsRef.current
        .map((point, index) => ({
          ...point,
          opacity: (index + 1) / pointsRef.current.length,
          size: 4 + (index / pointsRef.current.length) * 8,
        }))
        .filter((point) => point.opacity > 0.05);

      if (containerRef.current) {
        const currentPoints = [...pointsRef.current];
        const existingDots = containerRef.current.querySelectorAll(".trail-dot");
        existingDots.forEach((dot, index) => {
          if (currentPoints[index]) {
            const point = currentPoints[index];
            const htmlDot = dot as HTMLElement;
            htmlDot.style.transform = `translate(${point.x}px, ${point.y}px)`;
            htmlDot.style.opacity = String(point.opacity);
            htmlDot.style.width = `${point.size}px`;
            htmlDot.style.height = `${point.size}px`;
            htmlDot.style.backgroundColor = COLORS[index % COLORS.length];
          }
        });

        while (containerRef.current.children.length < currentPoints.length) {
          const dot = document.createElement("div");
          dot.className = "trail-dot";
          dot.style.position = "fixed";
          dot.style.borderRadius = "50%";
          dot.style.pointerEvents = "none";
          dot.style.transform = "translate(-50%, -50%)";
          dot.style.transition = "opacity 0.1s ease-out";
          containerRef.current.appendChild(dot);
        }

        while (containerRef.current.children.length > currentPoints.length) {
          containerRef.current.removeChild(containerRef.current.lastChild!);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
    />
  );
}
