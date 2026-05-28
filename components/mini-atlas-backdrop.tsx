"use client";

import { useEffect, useRef } from "react";

const nodes = [
  { x: 0.2, y: 0.36, r: 5, color: "#22d3ee" },
  { x: 0.26, y: 0.42, r: 3, color: "#34d399" },
  { x: 0.43, y: 0.34, r: 4, color: "#60a5fa" },
  { x: 0.5, y: 0.31, r: 4, color: "#facc15" },
  { x: 0.6, y: 0.47, r: 5, color: "#a78bfa" },
  { x: 0.7, y: 0.38, r: 4, color: "#22d3ee" },
  { x: 0.78, y: 0.62, r: 4, color: "#34d399" },
  { x: 0.32, y: 0.7, r: 4, color: "#f97316" },
  { x: 0.53, y: 0.68, r: 3, color: "#22d3ee" }
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [1, 7],
  [7, 8],
  [8, 4]
] as const;

export function MiniAtlasBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animation = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#061019";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(148, 163, 184, 0.08)";
      context.lineWidth = 1;
      for (let x = 0; x < width; x += 34) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += 34) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle = "rgba(34, 211, 238, 0.16)";
      context.lineWidth = 1.5;
      links.forEach(([a, b], index) => {
        const start = nodes[a];
        const end = nodes[b];
        const pulse = (Math.sin(frame / 35 + index) + 1) / 2;
        context.globalAlpha = 0.35 + pulse * 0.45;
        context.beginPath();
        context.moveTo(start.x * width, start.y * height);
        context.lineTo(end.x * width, end.y * height);
        context.stroke();
      });
      context.globalAlpha = 1;

      nodes.forEach((node, index) => {
        const pulse = (Math.sin(frame / 28 + index * 0.9) + 1) / 2;
        context.beginPath();
        context.arc(node.x * width, node.y * height, node.r + pulse * 2.2, 0, Math.PI * 2);
        context.fillStyle = node.color;
        context.globalAlpha = 0.3;
        context.fill();
        context.beginPath();
        context.arc(node.x * width, node.y * height, node.r, 0, Math.PI * 2);
        context.globalAlpha = 0.95;
        context.fill();
      });
      context.globalAlpha = 1;

      const scanY = ((frame % 260) / 260) * height;
      context.fillStyle = "rgba(34, 211, 238, 0.08)";
      context.fillRect(0, scanY, width, 2);

      frame += 1;
      animation = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animation);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
