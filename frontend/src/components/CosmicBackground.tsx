import { useEffect, useRef } from 'react';

// Simple canvas-based starfield for a premium feel
export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = 0;
    let height = 0;

    interface Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
      color: string;
    }

    const STAR_COLORS = [
      'rgba(232,213,163,', // starlight
      'rgba(157,147,248,', // aurora
      'rgba(255,255,255,', // white
      'rgba(196,132,252,', // mystic
    ];

    let stars: Star[] = [];

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const count = Math.floor((width * height) / 4500);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      }));
    }

    function draw(t: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const gradient = ctx.createRadialGradient(
        width * 0.3, height * 0.2, 0,
        width * 0.5, height * 0.5, width * 0.9
      );
      gradient.addColorStop(0, '#0d1128');
      gradient.addColorStop(0.5, '#080c19');
      gradient.addColorStop(1, '#05070f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle nebula clouds
      drawNebula(ctx, width * 0.15, height * 0.3, width * 0.25, 'rgba(123,110,246,0.025)');
      drawNebula(ctx, width * 0.75, height * 0.6, width * 0.2, 'rgba(244,162,54,0.02)');
      drawNebula(ctx, width * 0.5, height * 0.8, width * 0.3, 'rgba(192,132,252,0.02)');

      // Stars
      stars.forEach((star) => {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.opacity * (0.6 + 0.4 * twinkle);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${opacity.toFixed(2)})`;
        ctx.fill();

        // Glow for larger stars
        if (star.radius > 0.9) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
          glow.addColorStop(0, `${star.color}${(opacity * 0.3).toFixed(2)})`);
          glow.addColorStop(1, `${star.color}0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });

      animFrame = requestAnimationFrame(draw);
    }

    function drawNebula(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
      color: string
    ) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    resize();
    window.addEventListener('resize', resize);
    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
}
