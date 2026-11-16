// Planes live in CSS-pixel world units (camera distance chosen so 1 unit = 1px at z=0).
// Every DOM-synced plane is wrapped around a horizontal drum: near the viewport centre it is
// flat, towards the top/bottom edges it tilts away. The drum radius shrinks with scroll
// velocity, so fast scrolling bends the page and settling flattens it again.
export const drumVertex = /* glsl */ `
uniform vec2 uViewport;
uniform float uRadius;
uniform float uBulge;
varying vec2 vUv;
varying float vShade;

void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  float th = clamp(w.y / uRadius, -1.45, 1.45);
  w.z += uRadius * (cos(th) - 1.0);
  w.y = uRadius * sin(th);
  float nx = w.x / (uViewport.x * 0.5);
  w.z -= uBulge * nx * nx * uViewport.y * 0.12;
  vShade = 1.0 - (1.0 - cos(th)) * 0.85;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const common = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
`;

// Hero sheet: CRT-curved grid plus a portrait that assembles itself.
// uReveal 0 -> 0.35: blocky outline traced in grid cells; 0.35 -> 0.7: cyan block fill;
// 0.7 -> 1: blocks shrink until the photo resolves to grayscale.
// Pointer movement re-pixelates a radius around the cursor and sorts the blocks sideways.
export const heroFragment = /* glsl */ `
uniform sampler2D uPortrait;
uniform vec4 uCrop;        // x, y, w, h in texture uv
uniform vec3 uBox;         // portrait centre (x, y) and size, in sheet height units
uniform vec2 uSize;
uniform float uReveal;
uniform vec2 uMouse;       // sheet uv
uniform float uGlitch;
uniform float uTime;
varying vec2 vUv;
varying float vShade;
${common}

vec3 sampleCrop(vec2 p) {
  return texture2D(uPortrait, uCrop.xy + clamp(p, 0.0, 1.0) * uCrop.zw).rgb;
}

void main() {
  float aspect = uSize.x / uSize.y;
  vec2 c = (vUv - 0.5) * vec2(aspect, 1.0);
  float r2 = dot(c, c);

  vec2 g = c * (1.0 + 0.32 * r2) * 9.0;
  vec2 fw = fwidth(g) * 1.2;
  vec2 ld = abs(fract(g - 0.5) - 0.5) / fw;
  float line = 1.0 - min(min(ld.x, ld.y), 1.0);
  vec3 col = vec3(0.62, 0.68, 0.7) * line * 0.5 * smoothstep(0.0, 0.2, uReveal);
  col *= 1.0 - 0.55 * r2;

  vec2 p = (c - uBox.xy) / uBox.z + 0.5;
  if (p.x > 0.0 && p.x < 1.0 && p.y > 0.0 && p.y < 1.0) {
    vec2 m = ((uMouse - 0.5) * vec2(aspect, 1.0) - uBox.xy) / uBox.z + 0.5;
    float near = smoothstep(0.3, 0.0, length(p - m)) * uGlitch;

    float blocks = mix(40.0, 260.0, smoothstep(0.38, 1.0, uReveal));
    blocks = mix(blocks, 30.0, near);
    vec2 cell = floor(p * blocks);
    vec2 q = (cell + 0.5) / blocks;
    float h = hash(cell + floor(uTime * 14.0));
    q.x += (h - 0.5) * 0.18 * near * step(0.45, h);

    vec3 s = sampleCrop(q);
    float L = luma(s);
    float Lx = luma(sampleCrop(q + vec2(1.0 / blocks, 0.0)));
    float Ly = luma(sampleCrop(q + vec2(0.0, 1.0 / blocks)));
    float edge = smoothstep(0.035, 0.11, abs(L - Lx) + abs(L - Ly));

    vec2 cf = fract(p * blocks);
    float border = min(step(cf.x, 0.14) + step(cf.y, 0.14), 1.0);
    float appear = step(hash(cell), smoothstep(0.04, 0.42, uReveal) * 1.05);
    float fill = smoothstep(0.32, 0.62, uReveal) * appear;
    float settle = smoothstep(0.68, 1.0, uReveal);

    vec3 cyan = vec3(0.55, 0.96, 1.0);
    vec3 gray = vec3(pow(L, 1.08));
    vec3 lit = mix(cyan * (0.35 + L * 1.1), gray, settle);
    vec3 outline = cyan * 0.8 * edge * border * appear;
    vec3 face = mix(outline, lit, fill);
    face += near * step(0.72, h) * mix(vec3(1.0, 0.25, 0.6), vec3(0.2, 0.7, 1.0), h) * 0.7;

    float oval = smoothstep(0.52, 0.36, length((p - vec2(0.5, 0.47)) * vec2(1.1, 1.0)));
    float a = oval * max(edge * border * appear * (1.0 - fill), fill);
    col = mix(col, face, a);
  }

  gl_FragColor = vec4(col * vShade, 1.0);
}
`;

// Project posters: cover-fit texture, pixel-torn top/bottom edges while entering or moving fast,
// RGB split proportional to velocity, a block-pixel pulse on hover.
export const posterFragment = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uSize;
uniform vec2 uTexSize;
uniform float uVel;
uniform float uTime;
uniform float uHover;
uniform float uPulse;
uniform float uEnter;
varying vec2 vUv;
varying float vShade;
${common}

void main() {
  vec2 uv = vUv;
  float ra = uSize.x / uSize.y;
  float ta = uTexSize.x / uTexSize.y;
  vec2 s = ra > ta ? vec2(1.0, ta / ra) : vec2(ra / ta, 1.0);
  vec2 t = (uv - 0.5) * s * (1.0 - 0.05 * uHover) + 0.5;

  float v = clamp(abs(uVel), 0.0, 1.0);
  float column = floor(uv.x * 54.0);
  float n = hash(vec2(column, floor(uTime * 16.0)));
  float tear = (v * 0.16 + (1.0 - uEnter) * 0.55) * n;
  float edge = min(uv.y, 1.0 - uv.y);
  if (edge < tear * 0.5) discard;

  float streak = (1.0 - smoothstep(tear * 0.5, tear * 0.5 + 0.07, edge)) * step(0.002, tear);
  t.y = mix(t.y, (floor(t.y * 14.0) + 0.5) / 14.0, streak);

  float blocks = mix(1400.0, 34.0, uPulse);
  t = (floor(t * blocks) + 0.5) / blocks;

  float shift = v * 0.014;
  vec3 c = vec3(
    texture2D(uTex, t + vec2(shift, 0.0)).r,
    texture2D(uTex, t).g,
    texture2D(uTex, t - vec2(shift, 0.0)).b
  );
  gl_FragColor = vec4(c * vShade, 1.0);
}
`;

export const quadVertex = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Full-screen pass: paper everywhere except a rounded window that grows from card size to the
// whole viewport. Inside the window, a raymarched corridor of server racks; scroll moves the
// camera forward, the tint shifts per chapter, the vanishing point glows.
export const corridorFragment = /* glsl */ `
uniform vec2 uRes;
uniform vec4 uRect;     // centre xy, half size xy (device px, bottom-left origin)
uniform vec3 uView;     // centre xy and half height used to project rays
uniform float uCorner;
uniform float uOpen;
uniform float uTravel;
uniform vec3 uTint;
uniform vec2 uLook;
uniform vec3 uPaper;
uniform float uOn;

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float sdRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 map(vec3 p) {
  vec3 q = p;
  q.z = mod(q.z, 1.6) - 0.8;
  float rack = sdBox(vec3(abs(q.x) - 1.95, q.y + 0.05, q.z), vec3(0.42, 1.3, 0.64));
  float arch = sdBox(vec3(q.x, q.y - 1.62, q.z), vec3(1.6, 0.07, 0.1));
  float floorP = p.y + 1.35;
  float rail = length(vec2(abs(p.x) - 0.38, p.y + 1.3)) - 0.03;
  vec2 r = vec2(rack, 1.0);
  if (arch < r.x) r = vec2(arch, 2.0);
  if (floorP < r.x) r = vec2(floorP, 3.0);
  if (rail < r.x) r = vec2(rail, 4.0);
  return r;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    map(p + e.xyy).x - map(p - e.xyy).x,
    map(p + e.yxy).x - map(p - e.yxy).x,
    map(p + e.yyx).x - map(p - e.yyx).x
  ));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float d = sdRect(frag - uRect.xy, uRect.zw, uCorner);
  if (uOn < 0.5 || d > 0.0) {
    gl_FragColor = vec4(uPaper, 1.0);
    return;
  }

  vec2 uv = (frag - uView.xy) / uView.z;
  uv *= 1.0 + (1.0 - uOpen) * 0.22 * dot(uv, uv);

  vec3 ro = vec3(uLook.x * 0.3, 0.15 + uLook.y * 0.15, -uTravel);
  vec3 rd = normalize(vec3(uv * 0.62 + uLook * vec2(0.08, 0.05), -1.0));

  float t = 0.0;
  vec2 hit = vec2(0.0);
  for (int i = 0; i < 80; i++) {
    hit = map(ro + rd * t);
    if (hit.x < 0.002 || t > 36.0) break;
    t += hit.x * 0.9;
  }

  vec3 col = vec3(0.0);
  if (t < 36.0) {
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    float diff = max(dot(n, normalize(vec3(0.3, 0.9, 0.5))), 0.0) * 0.55 + 0.22;
    float albedo = hit.y == 1.0 ? 0.34 : hit.y == 2.0 ? 0.5 : hit.y == 3.0 ? 0.1 : 0.7;
    vec3 base = vec3(albedo) * diff * mix(vec3(1.0), uTint, 0.55);
    if (hit.y == 1.0) {
      float led = step(0.82, fract(p.y * 6.0)) * step(0.55, fract(p.z * 4.0 + floor(p.y * 6.0) * 0.37));
      base += uTint * led * 1.4 * step(0.3, abs(n.x));
    }
    if (hit.y == 3.0) {
      vec2 gl = abs(fract(p.xz * 2.0) - 0.5);
      base += uTint * 0.08 * step(0.47, max(gl.x, gl.y));
    }
    if (hit.y == 4.0) base += uTint * 0.6;
    col = base;
  }

  float fog = 1.0 - exp(-t * 0.085);
  vec3 fogCol = uTint * (0.12 + 1.1 * exp(-dot(uv, uv) * 3.5));
  col = mix(col, fogCol, fog);
  col *= 1.0 - 0.35 * dot(uv * 0.5, uv * 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;
