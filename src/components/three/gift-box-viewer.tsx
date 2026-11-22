"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import {
  Gift,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Rotate3d,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";
import { GiftBoxRig, StudioLights } from "@/components/three/gift-box-scene";

type Phase = "closed" | "unwrapping" | "revealed";

const CAMERA_CLOSED = { pos: [0, 1.75, 6.6] as [number, number, number], target: [0, 0.52, 0] as [number, number, number] };
const CAMERA_OPEN = { pos: [0, 3.1, 12.2] as [number, number, number], target: [0, 1.35, 0] as [number, number, number] };
const MIN_DISTANCE = 3.6;
const MAX_DISTANCE = 13;

function viewFor(mode: "closed" | "open", fit: number) {
  const base = mode === "open" ? CAMERA_OPEN : CAMERA_CLOSED;
  const dir = [
    base.pos[0] - base.target[0],
    base.pos[1] - base.target[1],
    base.pos[2] - base.target[2],
  ] as [number, number, number];
  return {
    pos: [
      base.target[0] + dir[0] * fit,
      base.target[1] + dir[1] * fit,
      base.target[2] + dir[2] * fit,
    ] as [number, number, number],
    target: base.target,
  };
}

function ViewerScene({
  phase,
  autoRotate,
  controlsRef,
  onSettled,
  onClosed,
  onReady,
}: {
  phase: Phase;
  autoRotate: boolean;
  controlsRef: React.RefObject<any>;
  onSettled: () => void;
  onClosed: () => void;
  onReady: () => void;
}) {
  const openRef = useRef(phase === "closed" ? 0 : 1);
  const hoveredRef = useRef<number | null>(null);

  useEffect(() => {
    openRef.current = phase === "closed" ? 0 : 1;
  }, [phase]);

  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    readyRef.current();
  }, []);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.7]}
      camera={{ position: CAMERA_CLOSED.pos, fov: 32, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      style={{ touchAction: "none" }}
      aria-label="Interactive 3D gift box viewer"
    >
      <StudioLights />
      <GiftBoxRig
        openRef={openRef}
        reduced={false}
        hoveredRef={hoveredRef}
        onHover={(index) => {
          hoveredRef.current = index;
        }}
        onToggle={() => {}}
        cameraMode="viewer"
        duration={2.4}
        onSettled={onSettled}
        onClosed={onClosed}
      />
      <ContactShadows
        position={[0, -0.36, 0]}
        opacity={0.34}
        scale={13}
        blur={2.8}
        far={5}
        resolution={512}
        color="#5a4a36"
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.85}
        zoomSpeed={0.9}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2.08}
        target={CAMERA_CLOSED.target}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
      />
    </Canvas>
  );
}

export default function GiftBoxViewer({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const [autoRotate, setAutoRotate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const close = useCallback(() => {
    const el = shellRef.current;
    if (!el) {
      onClose();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClose();
    };
    gsap.to(el, {
      opacity: 0,
      scale: 0.97,
      duration: 0.32,
      ease: "power2.in",
      onComplete: finish,
    });
    window.setTimeout(finish, 700);
  }, [onClose]);

  // enter transition
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" },
    );
  }, []);

  // lock page scroll + Escape to close
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [close]);

  // fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const tweenView = useCallback((mode: "closed" | "open") => {
    const controls = controlsRef.current;
    if (!controls) return;
    const view = mode === "open" ? CAMERA_OPEN : CAMERA_CLOSED;
    const cam = controls.object;
    gsap.to(cam.position, {
      x: view.pos[0],
      y: view.pos[1],
      z: view.pos[2],
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => controls.update(),
    });
    gsap.to(controls.target, {
      x: view.target[0],
      y: view.target[1],
      z: view.target[2],
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => controls.update(),
    });
  }, []);

  const unwrap = useCallback(() => {
    if (phase === "unwrapping") return;
    const controls = controlsRef.current;
    if (controls) controls.enabled = false;
    setAutoRotate(false);
    setPhase("unwrapping");
    tweenView("open");
  }, [phase, tweenView]);

  const handleSettled = useCallback(() => {
    setPhase("revealed");
    const controls = controlsRef.current;
    if (controls) controls.enabled = true;
  }, []);

  const handleClosed = useCallback(() => {
    if (phase === "unwrapping") return;
    setPhase("closed");
    const controls = controlsRef.current;
    if (controls) controls.enabled = true;
  }, [phase]);

  const replay = useCallback(() => {
    const controls = controlsRef.current;
    if (controls) controls.enabled = false;
    setPhase("closed");
    tweenView("closed");
    window.setTimeout(() => {
      setPhase("unwrapping");
      tweenView("open");
    }, 1300);
  }, [tweenView]);

  const closeBox = useCallback(() => {
    setPhase("closed");
    setAutoRotate(false);
    tweenView("closed");
  }, [tweenView]);

  const zoomBy = useCallback((factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    const offset = cam.position.clone().sub(controls.target);
    const distance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, offset.length() * factor));
    offset.setLength(distance);
    gsap.to(cam.position, {
      x: controls.target.x + offset.x,
      y: controls.target.y + offset.y,
      z: controls.target.z + offset.z,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: () => controls.update(),
    });
  }, []);

  const resetView = useCallback(() => {
    setAutoRotate(false);
    tweenView(phase === "closed" ? "closed" : "open");
  }, [phase, tweenView]);

  const toggleFullscreen = useCallback(async () => {
    const el = overlayRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      /* fullscreen may be blocked inside an iframe */
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[120] bg-[#f4ebdb]"
      role="dialog"
      aria-modal="true"
      aria-label="3D gift box showroom"
    >
      <div
        ref={shellRef}
        className="relative h-full w-full overflow-hidden bg-[radial-gradient(78%_68%_at_50%_42%,#fffaf2_0%,#f7eedd_54%,#ecdfca_100%)]"
      >
        {/* studio floor + vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(52%_40%_at_50%_88%,rgba(201,164,104,0.18),transparent_72%)]" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(120,98,70,0.16)]" />

        <div className="absolute inset-0" onDoubleClick={() => zoomBy(0.78)}>
          <ViewerScene
            phase={phase}
            autoRotate={autoRotate}
            controlsRef={controlsRef}
            onSettled={handleSettled}
            onClosed={handleClosed}
            onReady={() => setLoaded(true)}
          />
        </div>

        {!loaded && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-ink/60">
              <Loader2 className="size-6 animate-spin text-gold" />
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em]">Preparing the showroom…</p>
            </div>
          </div>
        )}

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
          <div className="pointer-events-auto">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-ink/45">RUTVI ENTERPRISE</p>
            <p className="mt-1 font-serif text-lg text-ink sm:text-xl">The Signature Hamper</p>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
              className="grid size-11 place-items-center rounded-full border border-ink/10 bg-white/80 text-ink/70 shadow-[0_10px_28px_-20px_rgba(20,19,15,0.8)] backdrop-blur transition-colors hover:border-navy/30 hover:text-navy"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close 3D showroom"
              className="grid size-11 place-items-center rounded-full border border-ink/10 bg-white/80 text-ink/70 shadow-[0_10px_28px_-20px_rgba(20,19,15,0.8)] backdrop-blur transition-colors hover:border-navy/30 hover:text-navy"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* hint */}
        <p className="pointer-events-none absolute left-1/2 top-[4.6rem] w-full -translate-x-1/2 text-center text-[0.55rem] uppercase tracking-[0.18em] text-ink/35 sm:top-[5.2rem]">
          Drag to rotate · Scroll or pinch to zoom
        </p>

        {/* bottom controls */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-4 sm:p-6">
          {phase === "revealed" ? (
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2.5">
              <button type="button" onClick={replay} className="btn-base btn-navy !min-h-11">
                <RotateCcw className="size-4" /> REPLAY ANIMATION
              </button>
              <button type="button" onClick={closeBox} className="btn-base btn-ghost !min-h-11">
                <Undo2 className="size-4" /> BACK TO THE BOX
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={unwrap}
              disabled={phase === "unwrapping"}
              className="btn-base btn-navy pointer-events-auto !min-h-12 !px-8 disabled:opacity-70"
            >
              {phase === "unwrapping" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> UNWRAPPING…
                </>
              ) : (
                <>
                  <Gift className="size-4" /> UNWRAP YOUR GIFT
                </>
              )}
            </button>
          )}

          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-ink/8 bg-white/75 p-1.5 shadow-[0_16px_40px_-28px_rgba(20,19,15,0.8)] backdrop-blur">
            <button
              type="button"
              onClick={() => setAutoRotate((value) => !value)}
              aria-pressed={autoRotate}
              aria-label="Toggle 360 degree rotation"
              className={`inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                autoRotate ? "bg-navy text-ivory" : "text-ink/60 hover:text-navy"
              }`}
            >
              <Rotate3d className="size-4" />
              <span className="hidden sm:inline">Rotate 360°</span>
            </button>
            <span className="h-6 w-px bg-ink/10" />
            <button
              type="button"
              onClick={() => zoomBy(0.82)}
              aria-label="Zoom in"
              className="grid size-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-cream hover:text-navy"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(1.22)}
              aria-label="Zoom out"
              className="grid size-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-cream hover:text-navy"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset camera"
              className="grid size-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-cream hover:text-navy"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
