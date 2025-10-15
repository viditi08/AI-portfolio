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

    // Disable interaction to avoid pointer errors and keep UI clickable
    const config = {
      TRANSPARENT: true,
      BACK_COLOR: { r: 0, g: 0, b: 0, a: 0 },
      TRIGGER: 'none', // no pointer handling
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.5,
      SHADING: true,
      COLORFUL: true,
      PAUSED: false,
      BLOOM: true,
      BLOOM_ITERATIONS: 6,
      BLOOM_RESOLUTION: 256,
      BLOOM_INTENSITY: 0.7,
      BLOOM_THRESHOLD: 0.6,
      BLOOM_SOFT_KNEE: 0.7,
      SUNRAYS: true,
      SUNRAYS_RESOLUTION: 128,
      SUNRAYS_WEIGHT: 1.0,
    };

    WebGLFluid(canvas, config);
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
        zIndex: -1,
        background: 'transparent',
        pointerEvents: 'none', // ensure background never blocks clicks
      }}
    />
  );
}

const FluidBackground = memo(FluidCanvas);
export default FluidBackground;