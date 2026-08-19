"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 히어로에 얹는 실시간 온천 증기 레이어.
 *
 * three.js 같은 3D 라이브러리 없이 WebGL 프래그먼트 셰이더 하나로 그린다.
 * (이 레포는 런타임 의존성 5개를 유지하는 것이 원칙이라 셰이더를 직접 쓴다)
 *
 * 출력은 스트레이트 알파라, 뒤에 깔린 히어로 사진 위로 김이 흐르듯 합성된다.
 * WebGL을 못 쓰거나 셰이더 컴파일이 실패하면 아무것도 그리지 않고 `onFallback`을
 * 호출한다 — 부모가 CSS 그라데이션 증기로 대체한다.
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;  // 화면 좌표계(p와 동일 정규화), 부드럽게 추종
uniform float u_reveal;   // 0→1 인트로 페이드인
uniform float u_scroll;   // 0→1 스크롤 진행 (내려갈수록 김이 걷힌다)

const vec3 PINE  = vec3(0.137, 0.251, 0.204);
const vec3 SAGE  = vec3(0.498, 0.659, 0.576);
const vec3 EMBER = vec3(0.878, 0.541, 0.341);
const vec3 MIST  = vec3(0.973, 0.953, 0.918);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  float t = u_time;

  // ── 포인터가 만드는 국소 소용돌이 — 손을 저으면 김이 흩어지는 느낌 ──
  vec2 pd = p - u_pointer;
  float pr = length(pd);
  float pull = exp(-pr * pr * 5.0);

  // ── 2단 도메인 워프 ── 난류처럼 접히는 증기 구조를 만든다
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(0.0, -t * 0.05)),
    fbm(p * 1.4 + vec2(4.7, 2.3) + t * 0.04)
  );
  vec2 r = vec2(
    fbm(p * 2.1 + 1.8 * q + vec2(1.7, 9.2) - t * 0.09),
    fbm(p * 2.1 + 1.8 * q + vec2(8.3, 2.8) - t * 0.07)
  );
  r += normalize(pd + vec2(1e-4)) * pull * 0.34 * sin(t * 0.9 - pr * 7.0);

  float steam = fbm(p * 1.9 + 2.4 * r + vec2(0.0, -t * 0.16));

  // 아래에서 피어올라 위로 갈수록 옅어지는 밀도 분포
  float rise = smoothstep(-0.05, 0.95, uv.y);
  float density = steam * (1.0 - rise * 0.62);
  // 하한을 높게 잡으면 옅은 부분이 잘려 나가 뿌연 덩어리 대신 가닥이 남는다
  density = smoothstep(0.30, 0.84, density + 0.05 * (1.0 - rise));

  // ── 바닥의 온천 수면 ── 잔물결이 만드는 커스틱
  float waterMask = smoothstep(0.36, 0.06, uv.y);
  vec2 wp = vec2(p.x * 2.2, uv.y * 7.0);
  float w1 = sin(wp.x * 3.0 + t * 0.8 + fbm(wp * 1.5 + t * 0.15) * 4.0);
  float w2 = sin(wp.x * 5.3 - t * 0.55 + fbm(wp * 2.2 - t * 0.10) * 3.0);
  float caustic = pow(max(w1 * 0.5 + w2 * 0.5, 0.0), 3.0);

  // ── 색 ── 딥그린 물속에서 세이지빛 김이 올라오고, 우상단 광원이 앰버로 물들인다
  vec3 col = mix(PINE, SAGE, smoothstep(0.0, 1.0, steam));
  col = mix(col, MIST, smoothstep(0.45, 1.0, density) * 0.72);

  float ray = smoothstep(0.0, 1.0, 1.0 - length(p - vec2(0.55, 0.42)) * 0.9);
  col += EMBER * ray * 0.30 * (0.5 + 0.5 * steam);
  col += EMBER * caustic * waterMask * 0.50;
  col += MIST * caustic * waterMask * 0.22;

  // ── 빛기둥 ── 오른쪽 위에서 비스듬히 내려와 김 사이로 어른거린다.
  // 본문은 왼쪽에 있으므로 x가 양수인 쪽에서만 세워 대비를 해치지 않는다.
  vec2 lp = p - vec2(0.66, 0.5);
  float beam = exp(-pow(lp.x * 0.80 + lp.y * 0.52, 2.0) * 9.0);
  beam *= smoothstep(-0.15, 0.62, p.x);
  beam *= smoothstep(1.05, 0.18, uv.y);
  beam *= 0.45 + 0.55 * fbm(p * 2.2 + vec2(0.0, -t * 0.08));
  col += EMBER * beam * 0.55;

  // ── 알파 ── 뒤의 사진이 비치도록 스트레이트 알파로 내보낸다
  float alpha = density * 0.40 + caustic * waterMask * 0.30 + pull * 0.07 + beam * 0.17;
  alpha *= u_reveal;
  alpha *= 1.0 - 0.55 * u_scroll;
  alpha *= smoothstep(0.0, 0.20, uv.x) * smoothstep(1.0, 0.80, uv.x);
  alpha *= smoothstep(1.0, 0.56, uv.y);
  alpha *= smoothstep(0.0, 0.26, uv.y);

  // 미세 디더 — 넓은 그라데이션의 밴딩을 없앤다
  alpha += (hash(frag + fract(t)) - 0.5) * 0.012;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function OnsenCanvas({
  className = "",
  onFallback,
}: {
  className?: string;
  onFallback?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  // onFallback을 effect 의존성에서 빼기 위해 ref로 고정한다 (부모가 인라인 함수를
  // 넘겨도 GL 컨텍스트가 재생성되지 않도록)
  const fallbackRef = useRef(onFallback);
  fallbackRef.current = onFallback;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts: WebGLContextAttributes = {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    };

    const gl = (canvas.getContext("webgl2", opts) ??
      canvas.getContext("webgl", opts)) as WebGLRenderingContext | null;

    if (!gl) {
      fallbackRef.current?.();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = vs && fs ? gl.createProgram() : null;

    if (!vs || !fs || !program) {
      fallbackRef.current?.();
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fallbackRef.current?.();
      return;
    }
    gl.useProgram(program);

    // 풀스크린 삼각형 하나 — 쿼드보다 프래그먼트 호출이 적다
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uPointer = gl.getUniformLocation(program, "u_pointer");
    const uReveal = gl.getUniformLocation(program, "u_reveal");
    const uScroll = gl.getUniformLocation(program, "u_scroll");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 저사양 기기에서 픽셀을 과하게 칠하지 않도록 DPR과 총 픽셀 수를 함께 제한한다
    const MAX_PIXELS = 1_600_000;
    let width = 1;
    let height = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // 아직 레이아웃 전이거나 숨겨진 조상 아래에 있으면 0이 나온다.
      // 이때 버퍼를 1px로 만들어 두면 다시 보일 때까지 깨진 채로 남으므로 건너뛴다.
      if (rect.width < 1 || rect.height < 1) return;
      const cssW = Math.round(rect.width);
      const cssH = Math.round(rect.height);
      let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      if (cssW * cssH * dpr * dpr > MAX_PIXELS) {
        dpr = Math.sqrt(MAX_PIXELS / (cssW * cssH));
      }
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    // ── 포인터 추종 ── 목표값으로 매 프레임 조금씩 따라가 관성을 준다
    let targetX = 0.25;
    let targetY = 0.1;
    let pointerX = targetX;
    let pointerY = targetY;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.height) return;
      const px = e.clientX - rect.left;
      const py = rect.height - (e.clientY - rect.top); // GL은 y가 위로 증가
      targetX = (px - rect.width * 0.5) / rect.height;
      targetY = (py - rect.height * 0.5) / rect.height;
    };

    let scroll = 0;
    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const h = rect.height || 1;
      scroll = Math.min(1, Math.max(0, -rect.top / h));
    };

    let visible = true;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible && !reduceMotion) start();
            },
            { threshold: 0 }
          )
        : null;
    io?.observe(canvas);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    let raf = 0;
    let running = false;
    let startedAt = 0;
    let last = 0;
    let clock = 0;

    const draw = (now: number) => {
      if (!startedAt) {
        startedAt = now;
        last = now;
      }
      // 탭 복귀 시 시간이 크게 튀어 화면이 순간이동하는 것을 막는다
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      clock += dt;

      pointerX += (targetX - pointerX) * Math.min(1, dt * 3.2);
      pointerY += (targetY - pointerY) * Math.min(1, dt * 3.2);

      const reveal = Math.min(1, (now - startedAt) / 1400);

      gl.uniform1f(uTime, clock);
      gl.uniform2f(uPointer, pointerX, pointerY);
      gl.uniform1f(uReveal, reveal);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (running && visible && document.visibilityState === "visible") {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && visible) start();
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      fallbackRef.current?.();
    };

    resize();
    onScroll();
    setReady(true);

    if (reduceMotion) {
      // 모션 최소화 설정에서는 애니메이션 없이 완성된 한 장면만 그린다
      gl.uniform1f(uTime, 12.5);
      gl.uniform2f(uPointer, 0.25, 0.1);
      gl.uniform1f(uReveal, 1);
      gl.uniform1f(uScroll, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      start();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      io?.disconnect();
      ro?.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`${className} transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
