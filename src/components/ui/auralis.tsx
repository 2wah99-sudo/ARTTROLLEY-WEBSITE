"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const vertexShaderGLSL = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderGLSL = `
precision highp float;
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[3];
uniform vec2  u_mouse;      // 0..1, smoothed toward pointer position
uniform float u_mouseStrength;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion — layers a few octaves of the same noise at
// shrinking amplitude/growing frequency. This is what turns a single flat
// noise pass into something that reads as slow-moving fluid/smoke instead
// of a static mottled texture — the actual difference between "shader
// background" and "looks like a video."
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p * freq);
    freq *= 2.02;
    amp *= 0.55;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv * vec2(ratio, 1.0);
  float t = u_time * 0.2;

  // Cursor warps the flow field like a stone dropped in liquid — a soft,
  // falling-off displacement rather than a hard distortion, so it reads as
  // the fluid responding to you, not a cursor-follow effect.
  vec2 mp = u_mouse * vec2(ratio, 1.0);
  float mouseDist = length(p - mp);
  vec2 mouseWarp = normalize(p - mp + 0.0001) * exp(-mouseDist * 2.2) * u_mouseStrength;
  p += mouseWarp;

  float n1 = fbm(p * 0.45 + t);
  float n2 = fbm(p * 0.8 - t * 0.55 + n1 * 0.6);
  float n3 = fbm(p * 1.6 + t * 0.35 - n2 * 0.4);

  float light = pow(abs(n2), 2.3) * 0.55;
  float sheen = pow(max(n3, 0.0), 3.0) * 0.35;

  vec3 col = vec3(0.02, 0.01, 0.01);

  col += u_colors[0] * smoothstep(0.05, 1.0, n1) * 0.55;
  col += u_colors[1] * light;
  col += u_colors[2] * sheen;

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.5;

  float dist = length(uv - 0.5);
  col *= smoothstep(1.2, 0.2, dist);

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface AuralisProps {
  colors?: string[];
  speed?: number;
  grain?: number;
  height?: string;
  className?: string;
}

const DEFAULT_COLORS = ["#ef4444", "#dc2626", "#b91c1c"];

const Auralis = ({
  colors = DEFAULT_COLORS,
  speed = 0.3,
  grain = 0.6,
  height = "100vh",
  className,
}: AuralisProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) return;

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderGLSL));
    gl.attachShader(
      program,
      createShader(gl.FRAGMENT_SHADER, fragmentShaderGLSL),
    );
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      res: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      grain: gl.getUniformLocation(program, "u_grain"),
      colors: gl.getUniformLocation(program, "u_colors"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mouseStrength: gl.getUniformLocation(program, "u_mouseStrength"),
    };

    // Pointer position, smoothed toward the target each frame rather than
    // snapping — the same lerp-toward-target trick as everything else on
    // this site's motion system, so the liquid warp trails the cursor
    // instead of jumping to it.
    const mouseTarget = { x: 0.5, y: 0.5 }
    const mouseSmoothed = { x: 0.5, y: 0.5 }
    let mouseStrengthTarget = 0
    let mouseStrengthSmoothed = 0

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.x = (e.clientX - rect.left) / rect.width;
      mouseTarget.y = 1 - (e.clientY - rect.top) / rect.height;
      mouseStrengthTarget = 0.14;
    };
    const onPointerLeave = () => { mouseStrengthTarget = 0 };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      // This canvas is sticky-pinned behind roughly half the page's scroll
      // depth and never unmounts, so its per-pixel cost (a noise fragment
      // shader evaluated for every pixel, every frame) is paid constantly.
      // Capping the backing resolution well below native retina density is
      // the cheapest lever available — the noise pattern reads identically
      // soft-focus at 1x as it does at 2-3x.
      const dpr = Math.min(window.devicePixelRatio, 1);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf: number;
    let running = true;
    let lastDraw = 0;
    // Flowing noise reads just as smooth at ~30fps as at 60 — halving the
    // draw rate halves the GPU cost for a background layer nobody is
    // looking at directly.
    const FRAME_INTERVAL = 1000 / 30;

    const render = (t: number) => {
      raf = requestAnimationFrame(render);
      if (!running || t - lastDraw < FRAME_INTERVAL) return;
      lastDraw = t;

      gl.uniform2f(locs.res, canvas.width, canvas.height);
      gl.uniform1f(locs.time, t * 0.001 * speed);
      gl.uniform1f(locs.grain, grain);

      const flat = new Float32Array(colors.slice(0, 3).flatMap(hexToRgb));
      gl.uniform3fv(locs.colors, flat);

      mouseSmoothed.x += (mouseTarget.x - mouseSmoothed.x) * 0.06;
      mouseSmoothed.y += (mouseTarget.y - mouseSmoothed.y) * 0.06;
      mouseStrengthSmoothed += (mouseStrengthTarget - mouseStrengthSmoothed) * 0.04;
      gl.uniform2f(locs.mouse, mouseSmoothed.x, mouseSmoothed.y);
      gl.uniform1f(locs.mouseStrength, mouseStrengthSmoothed);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const onVisibility = () => { running = !document.hidden };
    document.addEventListener('visibilitychange', onVisibility);

    raf = requestAnimationFrame(render);
    return () => {
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
    };
  }, [colors, speed, grain]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={cn("relative w-full overflow-hidden bg-[#010103]", className)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center" />
    </div>
  );
};

export default Auralis;
