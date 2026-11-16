const GLYPHS = '#/\\<>_=+*%01[]{}';

// One-shot decode: characters resolve left to right out of noise. The final text is exposed
// to assistive tech through aria-label for the duration of the effect.
export function scramble(el, { delay = 0, duration = 700, reduced = false } = {}) {
  const final = el.dataset.final ?? el.textContent.trim().replace(/\s+/g, ' ');
  el.dataset.final = final;
  if (reduced) {
    el.textContent = final;
    return;
  }
  el.setAttribute('aria-label', final);
  const start = performance.now() + delay;
  const chars = [...final];
  const frame = (now) => {
    const t = Math.max(0, (now - start) / duration);
    const resolved = Math.floor(t * chars.length);
    el.textContent = chars
      .map((ch, i) => (i < resolved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
      .join('');
    if (t < 1) requestAnimationFrame(frame);
    else {
      el.textContent = final;
      el.removeAttribute('aria-label');
    }
  };
  requestAnimationFrame(frame);
}
