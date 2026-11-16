import * as THREE from 'three';
import { corridorFragment, drumVertex, heroFragment, posterFragment, quadVertex } from './shaders.js';
import { POSTER_SIZE } from './posters.js';

const PAPER = new THREE.Vector3(0.933, 0.941, 0.949);
const TINTS = {
  about: new THREE.Vector3(0.8, 0.84, 0.9),
  more: new THREE.Vector3(0.35, 1.0, 0.6),
  path: new THREE.Vector3(0.32, 0.6, 1.0),
  contact: new THREE.Vector3(1.0, 0.3, 0.14),
};
const CAMERA_DISTANCE = 1200;
const FLAT = 1e6;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

export function createStage({ canvas, portrait, posters, reduced }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 6000);
  camera.position.z = CAMERA_DISTANCE;

  const viewport = { value: new THREE.Vector2(1, 1) };
  const time = { value: 0 };

  const heroEl = document.querySelector('[data-gl="hero"]');
  const corridorEl = document.querySelector('[data-gl="corridor"]');
  const chapterTints = [...corridorEl.querySelectorAll('[data-tint]')].map((el) => TINTS[el.dataset.tint]);

  // Full-screen paper + corridor window.
  const corridor = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: corridorFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: new THREE.Vector2() },
        uRect: { value: new THREE.Vector4() },
        uView: { value: new THREE.Vector3() },
        uCorner: { value: 0 },
        uOpen: { value: 0 },
        uTravel: { value: 0 },
        uTint: { value: chapterTints[0].clone() },
        uLook: { value: new THREE.Vector2() },
        uPaper: { value: PAPER },
        uOn: { value: 0 },
      },
    }),
  );
  corridor.frustumCulled = false;
  corridor.renderOrder = 0;
  scene.add(corridor);

  const drumUniforms = () => ({
    uViewport: viewport,
    uRadius: { value: FLAT },
    uBulge: { value: 0 },
  });

  // Hero sheet.
  const portraitTex = new THREE.Texture(portrait);
  portraitTex.needsUpdate = true;
  const hero = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 24, 64),
    new THREE.ShaderMaterial({
      vertexShader: drumVertex,
      fragmentShader: heroFragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        ...drumUniforms(),
        uPortrait: { value: portraitTex },
        // Square crop of the GitHub avatar around the face (texture uv, bottom-left origin).
        uCrop: { value: new THREE.Vector4(0.18, 0.02, 0.6, 0.6) },
        uBox: { value: new THREE.Vector3() },
        uSize: { value: new THREE.Vector2() },
        uReveal: { value: reduced ? 1 : 0 },
        uMouse: { value: new THREE.Vector2(-9, -9) },
        uGlitch: { value: 0 },
        uTime: time,
      },
    }),
  );
  hero.renderOrder = 2;
  scene.add(hero);

  // Project posters.
  const posterMeshes = [...document.querySelectorAll('[data-gl="poster"]')].map((el) => {
    const tex = new THREE.CanvasTexture(posters[el.dataset.poster]);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 16, 48),
      new THREE.ShaderMaterial({
        vertexShader: drumVertex,
        fragmentShader: posterFragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          ...drumUniforms(),
          uTex: { value: tex },
          uSize: { value: new THREE.Vector2() },
          uTexSize: { value: new THREE.Vector2(POSTER_SIZE.w, POSTER_SIZE.h) },
          uVel: { value: 0 },
          uTime: time,
          uHover: { value: 0 },
          uPulse: { value: 0 },
          uEnter: { value: reduced ? 1 : 0 },
        },
      }),
    );
    mesh.renderOrder = 1;
    scene.add(mesh);
    return { el, mesh, u: mesh.material.uniforms };
  });

  let vw = 1;
  let vh = 1;
  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.fov = (2 * Math.atan(vh / 2 / CAMERA_DISTANCE) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    viewport.value.set(vw, vh);
    const dpr = renderer.getPixelRatio();
    corridor.material.uniforms.uRes.value.set(vw * dpr, vh * dpr);
  }

  function place(mesh, r) {
    mesh.scale.set(r.width, r.height, 1);
    mesh.position.set(r.left + r.width / 2 - vw / 2, vh / 2 - (r.top + r.height / 2), 0);
    mesh.visible = r.bottom > -vh * 0.6 && r.top < vh * 1.6;
  }

  // Pointer state: hero glitch and corridor parallax both ease back to rest.
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  function pointer(e) {
    look.tx = (e.clientX / vw) * 2 - 1;
    look.ty = -((e.clientY / vh) * 2 - 1);
    if (reduced) return;
    const r = heroEl.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom) {
      const u = hero.material.uniforms;
      u.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      u.uGlitch.value = Math.min(1, u.uGlitch.value + 0.35);
    }
  }

  function needsFrame() {
    return (
      hero.material.uniforms.uGlitch.value > 0.002 ||
      Math.abs(look.tx - look.x) > 0.002 ||
      Math.abs(look.ty - look.y) > 0.002
    );
  }

  function render(seconds, velocity) {
    time.value = seconds;
    const speed = reduced ? 0 : clamp(Math.abs(velocity), 0, 1);

    // Hero sheet: curls back harder as it leaves the top of the screen.
    const hr = heroEl.getBoundingClientRect();
    place(hero, hr);
    const hu = hero.material.uniforms;
    const curl = clamp(-hr.top / vh, 0, 1);
    hu.uRadius.value = reduced ? FLAT : vh * Math.min(lerp(7, 0.75, Math.pow(curl, 0.8)), lerp(7, 1.4, speed));
    hu.uBulge.value = reduced ? 0 : 0.12 + curl * 0.5;
    hu.uSize.value.set(hr.width, hr.height);
    const aspect = hr.width / hr.height;
    if (aspect >= 1) hu.uBox.value.set(0.06 * aspect, -0.02, 0.72);
    else hu.uBox.value.set(0, 0.16, Math.min(0.82, aspect * 1.05));
    hu.uGlitch.value *= 0.93;

    for (const p of posterMeshes) {
      const r = p.el.getBoundingClientRect();
      place(p.mesh, r);
      p.u.uSize.value.set(r.width, r.height);
      p.u.uVel.value = velocity;
      p.u.uRadius.value = reduced ? FLAT : vh * lerp(6, 1.3, speed);
      p.u.uBulge.value = reduced ? 0 : 0.15 + speed * 0.5;
      if (!reduced) p.u.uEnter.value = smooth(clamp((vh - r.top) / (vh * 0.45), 0, 1));
    }

    // Corridor window: grows from a card into the full viewport, then scrolls away at the end.
    const cu = corridor.material.uniforms;
    const cr = corridorEl.getBoundingClientRect();
    cu.uOn.value = cr.top < vh && cr.bottom > 0 ? 1 : 0;
    if (cu.uOn.value) {
      const dpr = renderer.getPixelRatio();
      const cardW = Math.min(vw * 0.7, 980);
      const cardH = Math.min(cardW * 0.62, vh * 0.7);
      let hw = vw / 2;
      let hh = vh / 2;
      let cy = vh / 2;
      let viewCy = vh / 2;
      let viewH = vh / 2;
      let open = 1;
      let corner = 0;
      if (cr.top > 0) {
        open = reduced ? 1 : smooth(clamp((vh - cr.top) / vh, 0, 1));
        hw = lerp(cardW, vw, open) / 2;
        hh = lerp(cardH, vh, open) / 2;
        cy = lerp(cr.top + cardH / 2 + vh * 0.08, vh / 2, open);
        if (reduced) cy = cr.top + hh;
        corner = lerp(28, 0, open) * dpr;
        viewCy = cy;
        viewH = hh;
      } else if (cr.bottom < vh) {
        hh = cr.bottom / 2;
        cy = cr.bottom / 2;
      }
      cu.uRect.value.set((vw / 2) * dpr, (vh - cy) * dpr, hw * dpr, hh * dpr);
      cu.uView.value.set((vw / 2) * dpr, (vh - viewCy) * dpr, viewH * dpr);
      cu.uCorner.value = corner;
      cu.uOpen.value = open;
      cu.uTravel.value = ((vh - cr.top) / vh) * 2.4;

      const f = clamp((vh * 0.5 - cr.top) / cr.height, 0, 0.9999) * chapterTints.length - 0.5;
      const i0 = clamp(Math.floor(f), 0, chapterTints.length - 1);
      const i1 = clamp(i0 + 1, 0, chapterTints.length - 1);
      const k = f < 0 ? 0 : smooth(clamp((f - Math.floor(f) - 0.3) / 0.4, 0, 1));
      cu.uTint.value.lerpVectors(chapterTints[i0], chapterTints[i1], k);

      look.x += (look.tx - look.x) * 0.06;
      look.y += (look.ty - look.y) * 0.06;
      cu.uLook.value.set(reduced ? 0 : look.x, reduced ? 0 : look.y);
    } else {
      look.x = look.tx;
      look.y = look.ty;
    }

    renderer.render(scene, camera);
  }

  function posterUniforms(el) {
    return posterMeshes.find((m) => m.el === el)?.u;
  }

  resize();
  return { resize, render, pointer, needsFrame, heroUniforms: hero.material.uniforms, posterUniforms };
}
