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

const sdRect = /* glsl */ `
float sdRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
`;

// Raymarched data-center aisle, in metres. Two rows of 600 mm cabinets face a 1.2 m cold aisle;
// each cabinet holds 1U or 2U servers (some slots blanked), with drive bays, vents and status
// LEDs drawn procedurally on the server faces. Raised-floor tiles reflect the room, yellow fibre
// trays hang from threaded rods, LED panels light the aisle. Rendered at reduced resolution into
// a target only while the corridor is on screen; LEDs blink between frames because frames are
// only drawn while something moves.
export const corridorMarchFragment = /* glsl */ `
uniform vec2 uToFull;   // gl_FragCoord (target px) -> full-resolution device px
uniform vec4 uRect;     // window centre xy, half size xy (device px, bottom-left origin)
uniform vec3 uView;     // projection centre xy and half height (device px)
uniform float uCorner;
uniform float uOpen;
uniform float uTravel;
uniform vec3 uTint;
uniform vec2 uLook;
uniform float uTime;

#define AISLE 0.6
#define RACK 0.62
#define LAMP 2.4
#define FAR 34.0
${sdRect}

float hash1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float sdBox2(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// Per-cabinet layout: unit height (1U or 2U) and which slots are blanked.
struct Slot { float cid; float cz; float lx; float h; float row; float yy; float empty; };
Slot slotAt(vec3 p) {
  Slot s;
  float side = p.x < 0.0 ? -1.0 : 1.0;
  float cell = floor(p.z / RACK);
  s.cid = cell * 2.0 + side;
  s.cz = p.z - (cell + 0.5) * RACK;
  s.lx = abs(p.x) - AISLE;
  s.h = hash1(vec2(s.cid, 7.0)) < 0.45 ? 0.0445 : 0.089;
  float uy = p.y - 0.09;
  s.row = clamp(floor(uy / s.h), 0.0, floor(1.86 / s.h) - 1.0);
  s.yy = uy - (s.row + 0.5) * s.h;
  s.empty = step(hash1(vec2(s.cid, s.row)), 0.16);
  return s;
}

float lampDist(vec3 p) {
  float lz = p.z - (floor(p.z / LAMP) + 0.5) * LAMP;
  return sdBox(vec3(p.x, p.y - 2.965, lz), vec3(0.12, 0.02, 0.75));
}

vec2 map(vec3 p) {
  Slot s = slotAt(p);
  float cab = sdBox(vec3(s.lx - 0.5, p.y - 1.0, s.cz), vec3(0.5, 1.0, 0.3));
  float recess = sdBox(vec3(s.lx, p.y - 1.02, s.cz), vec3(0.03, 0.93, 0.262));
  vec2 res = vec2(max(cab, -recess), 1.0);

  float depth = 0.018 + s.empty * 0.012;
  float unit = sdBox(vec3(s.lx - depth - 0.012, s.yy, s.cz), vec3(0.012, s.h * 0.5 - 0.0016, 0.252));
  if (unit < res.x) res = vec2(unit, 2.0);

  if (p.y < res.x) res = vec2(p.y, 3.0);
  float ceil = 3.0 - p.y;
  if (ceil < res.x) res = vec2(ceil, 4.0);
  float lamp = lampDist(p);
  if (lamp < res.x) res = vec2(lamp, 5.0);

  vec2 tq = vec2(abs(p.x) - 0.95, p.y - 2.3);
  float tray = max(sdBox2(tq, vec2(0.17, 0.06)), -sdBox2(tq - vec2(0.0, 0.03), vec2(0.152, 0.06)));
  if (tray < res.x) res = vec2(tray, 6.0);
  float cable = min(length(tq - vec2(-0.06, -0.012)) - 0.036, length(tq - vec2(0.05, -0.018)) - 0.03);
  if (cable < res.x) res = vec2(cable, 7.0);
  float rz = p.z - (floor(p.z / 1.2) + 0.5) * 1.2;
  float rod = max(length(vec2(abs(abs(p.x) - 0.95) - 0.165, rz)) - 0.006, 2.36 - p.y);
  if (rod < res.x) res = vec2(rod, 8.0);
  return res;
}

vec3 normalAt(vec3 p, float t) {
  vec2 k = vec2(1.0, -1.0) * (0.0006 + t * 0.0004);
  return normalize(
    k.xyy * map(p + k.xyy).x + k.yyx * map(p + k.yyx).x +
    k.yxy * map(p + k.yxy).x + k.xxx * map(p + k.xxx).x
  );
}

float occlusion(vec3 p, vec3 n) {
  float o = 0.0;
  float w = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.012 + 0.05 * float(i * i);
    o += (h - map(p + n * h).x) * w;
    w *= 0.6;
  }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}

vec3 lampColor() { return mix(vec3(0.9, 0.95, 1.0), uTint, 0.22); }

vec3 ledColor(float h) {
  vec3 c = h < 0.55 ? vec3(0.15, 1.0, 0.35) : h < 0.85 ? vec3(0.2, 0.55, 1.0) : vec3(1.0, 0.55, 0.08);
  return mix(c, uTint, 0.3);
}

// Surface description at a hit: albedo, emission and how glossy it is.
void material(vec3 p, float id, float t, out vec3 albedo, out vec3 emit, out float gloss) {
  emit = vec3(0.0);
  gloss = 0.15;
  float far = smoothstep(5.0, 1.2, t);          // fine detail fades out with distance
  float ledR = 0.0032 + t * 0.0011;            // LEDs never shrink below ~1px
  if (id == 1.0) {
    Slot s = slotAt(p);
    albedo = vec3(0.022);
    gloss = 0.35;
    // Asset label on the top of each cabinet frame.
    vec2 lab = vec2(s.cz, p.y - 1.975);
    if (s.lx < 0.002 && abs(lab.x) < 0.07 && abs(lab.y) < 0.012) {
      albedo = vec3(0.75);
      float bars = step(0.5, fract(lab.x * 140.0)) * step(abs(lab.y), 0.004) * step(abs(lab.x), 0.05);
      albedo = mix(albedo, vec3(0.05), bars * far);
    }
  } else if (id == 2.0) {
    Slot s = slotAt(p);
    float u = s.cz;
    float v = s.yy;
    if (s.empty > 0.5) {
      albedo = vec3(0.016);
      albedo *= 1.0 - 0.5 * step(0.5, fract(u * 60.0)) * step(abs(v), s.h * 0.2) * far;
    } else {
      albedo = vec3(0.04);
      gloss = 0.4;
      if (abs(u) > 0.226) albedo = vec3(0.13);                       // rack ears and handles
      if (u > -0.22 && u < 0.04) {                                  // drive bays
        float bw = 0.0325;
        float bi = floor((u + 0.22) / bw);
        float bu = fract((u + 0.22) / bw);
        float edge = step(bu, 0.07) + step(0.93, bu);
        albedo = mix(vec3(0.07), vec3(0.01), edge * far + (1.0 - far) * 0.3);
        vec2 lp = vec2((bi + 0.78) * bw - 0.22, s.h * 0.5 - 0.009);
        if (length(vec2(u, v) - lp) < ledR) {
          float on = step(0.22, hash3(vec3(s.cid, s.row, bi + floor(uTime * 7.0 + hash1(vec2(bi, s.row)) * 9.0))));
          emit += ledColor(hash3(vec3(s.cid, s.row, bi))) * on * 5.0;
        }
      }
      if (u > 0.06 && u < 0.2) {                                    // perforated vent
        vec2 g = fract(vec2(u, v) * 150.0) - 0.5;
        albedo *= mix(0.7, 0.35 + 0.65 * smoothstep(0.18, 0.3, length(g)), far);
      }
      if (length(vec2(u - 0.214, v - s.h * 0.22)) < ledR) emit += vec3(0.25, 0.6, 1.0) * 3.5;
      if (length(vec2(u - 0.214, v + s.h * 0.2)) < ledR) {
        float h = hash3(vec3(s.cid, s.row, 9.0));
        emit += ledColor(h) * step(0.3, hash3(vec3(s.cid, s.row, floor(uTime * 3.0)))) * 4.0;
      }
      albedo *= 0.55 + 0.45 * smoothstep(0.0, 0.0025, s.h * 0.5 - abs(v));
    }
  } else if (id == 3.0) {
    // 600 mm raised-floor tiles; perforated ones in front of the racks.
    vec2 tile = p.xz / 0.6;
    vec2 f = abs(fract(tile) - 0.5);
    float seam = smoothstep(0.492, 0.498, max(f.x, f.y));
    albedo = vec3(0.32, 0.33, 0.34) * (0.92 + 0.16 * hash1(floor(tile)));
    gloss = 0.55;
    if (abs(p.x) < AISLE && hash1(floor(tile) + 3.0) < 0.5) {
      vec2 g = fract(p.xz * 40.0) - 0.5;
      albedo *= mix(0.75, 0.55 + 0.45 * smoothstep(0.16, 0.24, length(g)), far);
      gloss = 0.3;
    }
    albedo *= 1.0 - 0.6 * seam;
  } else if (id == 4.0) {
    vec2 f = abs(fract(p.xz / 0.6) - 0.5);
    albedo = vec3(0.06) * (1.0 - 0.4 * step(0.49, max(f.x, f.y)));
  } else if (id == 5.0) {
    albedo = vec3(0.8);
    emit = lampColor() * 6.0;
  } else if (id == 6.0) {
    albedo = vec3(0.85, 0.6, 0.05);
    gloss = 0.3;
  } else if (id == 7.0) {
    albedo = abs(p.x) - 0.95 < -0.005 ? vec3(0.03, 0.12, 0.45) : vec3(0.02);
    gloss = 0.25;
  } else {
    albedo = vec3(0.25);
    gloss = 0.5;
  }
}

// Lit by the three nearest ceiling panels (long, downward-facing lights).
vec3 light(vec3 p, vec3 n, vec3 rd, vec3 albedo, float gloss) {
  vec3 diff = vec3(0.0);
  vec3 spec = vec3(0.0);
  float base = floor(p.z / LAMP);
  for (int k = -1; k <= 1; k++) {
    float c = (base + float(k) + 0.5) * LAMP;
    vec3 lp = vec3(0.0, 2.94, clamp(p.z, c - 0.75, c + 0.75));
    vec3 L = lp - p;
    float d2 = dot(L, L);
    vec3 l = L * inversesqrt(d2);
    float att = clamp(l.y * 1.6, 0.0, 1.0) / (1.0 + d2 * 0.4);
    diff += max(dot(n, l), 0.0) * att;
    vec3 hv = normalize(l - rd);
    spec += pow(max(dot(n, hv), 0.0), mix(8.0, 90.0, gloss)) * att * gloss;
  }
  vec3 lc = lampColor();
  vec3 ambient = mix(vec3(0.05), uTint * 0.08, 0.4) * (0.6 + 0.4 * n.y);
  return albedo * (diff * lc * 2.2 + ambient) + spec * lc * 1.4;
}

vec2 march(vec3 ro, vec3 rd, int steps, out float glow) {
  float t = 0.02;
  vec2 h = vec2(0.0, -1.0);
  glow = 0.0;
  for (int i = 0; i < 140; i++) {
    if (i >= steps) break;
    vec3 p = ro + rd * t;
    h = map(p);
    float ld = lampDist(p);
    glow += 0.0006 / (0.0008 + ld * ld);
    if (h.x < 0.0004 + t * 0.0006) return vec2(t, h.y);
    t += h.x * 0.8;
    if (t > FAR) break;
  }
  return vec2(FAR, -1.0);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 fogged(vec3 col, float t, vec2 uv) {
  vec3 fogCol = lampColor() * 0.035 + uTint * (0.05 + 0.55 * exp(-dot(uv, uv) * 4.0));
  return mix(col, fogCol, 1.0 - exp(-t * 0.07));
}

void main() {
  vec2 frag = gl_FragCoord.xy * uToFull;
  if (sdRect(frag - uRect.xy, uRect.zw + 2.0, uCorner) > 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec2 uv = (frag - uView.xy) / uView.z;
  uv *= 1.0 + (1.0 - uOpen) * 0.22 * dot(uv, uv);

  vec3 ro = vec3(uLook.x * 0.16, 1.55 + uLook.y * 0.08, -uTravel * 1.6);
  vec3 rd = normalize(vec3(uv * 0.6 + uLook * vec2(0.05, 0.035), -1.0));

  float glow;
  vec2 hit = march(ro, rd, 140, glow);
  vec3 col = vec3(0.0);
  if (hit.y > 0.0) {
    vec3 p = ro + rd * hit.x;
    vec3 n = normalAt(p, hit.x);
    vec3 albedo; vec3 emit; float gloss;
    material(p, hit.y, hit.x, albedo, emit, gloss);
    col = light(p, n, rd, albedo, gloss) * occlusion(p, n) + emit;

    // One reflection bounce off the polished floor.
    if (hit.y == 3.0) {
      vec3 r = reflect(rd, n);
      float rg;
      vec2 rh = march(p + n * 0.003, r, 70, rg);
      vec3 rc = lampColor() * rg * 0.004;
      if (rh.y > 0.0) {
        vec3 rp = p + r * rh.x;
        vec3 rn = normalAt(rp, hit.x + rh.x);
        vec3 ra; vec3 re; float rgl;
        material(rp, rh.y, hit.x + rh.x, ra, re, rgl);
        rc += light(rp, rn, r, ra, rgl) + re;
      }
      rc = fogged(rc, rh.x, uv);
      float fres = 0.06 + 0.5 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
      col = mix(col, rc, fres * gloss * 1.6);
    }
  }
  col = fogged(col, hit.x, uv);
  col += lampColor() * glow * 0.0035;

  col *= 1.15;
  col = aces(col);
  col = pow(col, vec3(1.0 / 2.2));
  col *= 1.0 - 0.32 * dot(uv * 0.5, uv * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Full-resolution pass: paper everywhere, the corridor texture inside the rounded window with an
// anti-aliased edge, plus a little film grain so the upscaled corridor keeps texture.
export const corridorCompositeFragment = /* glsl */ `
uniform vec2 uRes;
uniform vec4 uRect;
uniform float uCorner;
uniform vec3 uPaper;
uniform float uOn;
uniform float uTime;
uniform sampler2D uTex;
${sdRect}
float grain(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  float d = uOn > 0.5 ? sdRect(frag - uRect.xy, uRect.zw, uCorner) : 1.0;
  float inside = clamp(0.5 - d, 0.0, 1.0);
  if (inside <= 0.0) {
    gl_FragColor = vec4(uPaper, 1.0);
    return;
  }
  vec3 c = texture2D(uTex, frag / uRes).rgb;
  c += (grain(frag + fract(uTime) * 91.7) - 0.5) * 0.035;
  gl_FragColor = vec4(mix(uPaper, c, inside), 1.0);
}
`;
