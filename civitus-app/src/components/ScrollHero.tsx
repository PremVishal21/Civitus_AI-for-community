"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, Sparkles, Cpu } from "lucide-react";

interface ScrollHeroProps {
  onEnterPlatform: () => void;
}

export default function ScrollHero({ onEnterPlatform }: ScrollHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matterRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const totalFrames = 260;
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Preload all frame images in batches to prevent connection pooling and timeout errors
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = new Array(totalFrames);
    const formatNum = (num: number) => String(num).padStart(3, "0");
    
    const batchSize = 15; // Process 15 requests at a time
    let nextIndex = 1;

    const loadBatch = () => {
      if (nextIndex > totalFrames) return;
      
      const currentBatchSize = Math.min(batchSize, totalFrames - nextIndex + 1);
      let batchCompleted = 0;
      
      for (let j = 0; j < currentBatchSize; j++) {
        const frameId = nextIndex + j;
        const img = new Image();
        img.src = `/imgs/ezgif-frame-${formatNum(frameId)}.jpg`;
        
        img.onload = () => {
          loadedImages[frameId - 1] = img;
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
          batchCompleted++;
          
          if (batchCompleted === currentBatchSize) {
            nextIndex += currentBatchSize;
            loadBatch();
          }
          if (loadedCount === totalFrames) {
            setImages(loadedImages);
            setLoading(false);
          }
        };
        
        img.onerror = () => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
          batchCompleted++;
          
          if (batchCompleted === currentBatchSize) {
            nextIndex += currentBatchSize;
            loadBatch();
          }
          if (loadedCount === totalFrames) {
            setImages(loadedImages);
            setLoading(false);
          }
        };
      }
    };

    loadBatch();
  }, []);

  // Resize the canvas context backing store once on load/resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback((frameIndex: number, imgs: HTMLImageElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas || imgs.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nearest loaded neighbor image fallback
    let img = imgs[frameIndex];
    if (!img) {
      let minDistance = Infinity;
      let nearestIndex = -1;
      for (let i = 0; i < imgs.length; i++) {
        if (imgs[i]) {
          const dist = Math.abs(i - frameIndex);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = i;
          }
        }
      }
      if (nearestIndex !== -1) {
        img = imgs[nearestIndex];
      }
    }

    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = img.width / img.height;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    // Cover fit
    if (canvasRatio > imgRatio) {
      drawHeight = canvasWidth / imgRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, []);

  // Draw first frame once loaded
  useEffect(() => {
    if (!loading && images.length > 0) {
      resizeCanvas();
      drawFrame(0, images);
      // Dispatch global resize to prompt GSAP ScrollTrigger recalculation
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 150);
    }
  }, [loading, images, drawFrame, resizeCanvas]);

  // Auto-playing city animation loop
  useEffect(() => {
    if (loading || images.length === 0) return;

    let frameId = 0;
    let animId: number;
    let lastTime = 0;
    const fps = 30; // 30 FPS
    const interval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > interval) {
        lastTime = timestamp - (elapsed % interval);
        drawFrame(frameId, images);
        frameId = (frameId + 1) % totalFrames;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [loading, images, drawFrame]);

  // Listen for window resize to resize the canvas
  useEffect(() => {
    if (loading) return;

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [loading, resizeCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#F6F1E7] h-screen"
    >
      {/* Viewport wrapper */}
      <div className="relative h-full w-full overflow-hidden flex items-center justify-center">

        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F6F1E7] text-[#173328] z-50">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-zinc-200 animate-pulse"></div>
              <div
                className="absolute inset-0 rounded-full border-t-2 border-[#173328] animate-spin"
                style={{ animationDuration: "1.2s" }}
              ></div>
              <Cpu className="w-8 h-8 text-[#173328] animate-pulse" />
            </div>
            <h2 className="mt-8 text-4xl font-display font-medium tracking-wider text-[#173328] uppercase">
              CIVITAS AI
            </h2>
            <p className="mt-2 text-[#795835] text-sm font-sans tracking-wide">
              Initializing Spatial Grid Model ({loadProgress}%)
            </p>
          </div>
        ) : (
          /* Fullscreen Canvas */
          <div className="absolute inset-0 w-full h-full bg-[#F6F1E7]">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover select-none pointer-events-none crisp-canvas"
              style={{ transformOrigin: "center center", willChange: "transform, filter" }}
            />
            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#F6F1E7] via-transparent to-transparent z-10 pointer-events-none" />
          </div>
        )}

        {/* Scroll bounce indicator */}
        {!loading && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-[#173328]/75 text-xs tracking-widest uppercase animate-bounce pointer-events-none z-20 font-sans font-bold">
            <span>Scroll Down to Ingest</span>
            <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#173328] to-transparent" />
          </div>
        )}

        {/* Hero typography — left-aligned glassmorphism panel */}
        <div
          ref={matterRef}
          className="absolute left-10 md:left-24 top-1/2 max-w-2xl z-20 flex flex-col items-start text-left gap-6 px-8 py-10 md:px-12 md:py-14 rounded-[32px] neomorph-glass border border-white/50"
          style={{ transform: "translateY(-50%)", willChange: "transform, opacity" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neomorph-inset text-[#173328] text-[10px] font-bold tracking-widest uppercase font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#CFAC7D] animate-pulse" />
            <span>Introducing Community Decision Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-[#173328] via-[#2c5240] to-[#795835] bg-clip-text text-transparent leading-[1.05] drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)]">
            The AI Brain for Smart Communities
          </h1>

          <p className="text-base md:text-lg text-zinc-800 font-sans font-medium leading-relaxed max-w-lg">
            Consolidating climate alerts, environmental sensors, and healthcare capacity streams into a singular cognitive workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
