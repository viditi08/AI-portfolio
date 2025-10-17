import React, { useRef, useEffect, memo } from 'react';
import WebGLFluid from 'webgl-fluid';

function FluidCanvas() {
  const canvasRef = useRef(null);
  const inited = useRef(false);

  // Initialize fluid once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inited.current) return;
    inited.current = true;

    // Size once at mount
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fluid config
    const config = {
      TRANSPARENT: true,
      BACK_COLOR: { r: 0, g: 0, b: 0, a: 0 },
      TRIGGER: 'hover',
      IMMEDIATE: true,
      AUTO: false,
      SPLAT_COUNT: 6,
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.9,
      PRESSURE_DISSIPATION: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 12,
      SPLAT_RADIUS: 0.3,
      SPLAT_FORCE: 1500,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 4,
      PAUSED: false,
      BLOOM: true,
      BLOOM_ITERATIONS: 6,
      BLOOM_RESOLUTION: 256,
      BLOOM_INTENSITY: 0.6, // slightly reduced to avoid overpowering UI
      BLOOM_THRESHOLD: 0.6,
      BLOOM_SOFT_KNEE: 0.7,
      SUNRAYS: true,
      SUNRAYS_RESOLUTION: 128,
      SUNRAYS_WEIGHT: 1.0,
    };

    WebGLFluid(canvas, config);

    // Forward global pointer/touch events to the canvas so the simulation reacts
    // even though the canvas remains visually behind all content.
    const forwardMouse = (type, e) => {
      if (!canvas) return;
      const evt = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        button: e.button,
      });
      canvas.dispatchEvent(evt);
    };

    const onPointerMove = (e) => forwardMouse('mousemove', e);
    const onPointerDown = (e) => forwardMouse('mousedown', e);
    const onPointerUp = (e) => forwardMouse('mouseup', e);

    const onTouchMove = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      forwardMouse('mousemove', {
        clientX: t.clientX,
        clientY: t.clientY,
        screenX: t.screenX ?? 0,
        screenY: t.screenY ?? 0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
      });
    };
    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      forwardMouse('mousedown', {
        clientX: t.clientX,
        clientY: t.clientY,
        screenX: t.screenX ?? 0,
        screenY: t.screenY ?? 0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
      });
    };
    const onTouchEnd = (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      forwardMouse('mouseup', {
        clientX: t.clientX,
        clientY: t.clientY,
        screenX: t.screenX ?? 0,
        screenY: t.screenY ?? 0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Keep scroll behavior natural; fluid doesn't need wheel
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Resize canvas without re-initializing the simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, // behind UI content (z:11) and nav (z:10)
        background: 'transparent',
        pointerEvents: 'none', // never block UI; we forward global events to canvas
      }}
    />
  );
}

const FluidBackground = memo(FluidCanvas);
export default FluidBackground;