// Single source of truth for "should things move". The OS reduced-motion setting picks the
// default; the pause button overrides it and the choice is remembered. `still` is read at the
// moment an animation would start, so toggling takes effect without a reload.

const KEY = 'motion';
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const stored = localStorage.getItem(KEY);
const listeners = new Set();

let paused = stored === null ? media.matches : stored === 'paused';

function apply() {
  document.documentElement.classList.toggle('still', paused);
}

export const motion = {
  get still() {
    return paused;
  },
  set(value) {
    if (value === paused) return;
    paused = value;
    localStorage.setItem(KEY, paused ? 'paused' : 'on');
    apply();
    listeners.forEach((fn) => fn(paused));
  },
  toggle() {
    motion.set(!paused);
  },
  onChange(fn) {
    listeners.add(fn);
  },
};

media.addEventListener('change', () => {
  if (localStorage.getItem(KEY) === null) motion.set(media.matches);
});

apply();

// Header button: aria-pressed mirrors the paused state, label says what a click will do.
export function wirePauseButton(labels) {
  const btn = document.querySelector('[data-motion-toggle]');
  if (!btn) return;
  const sync = () => {
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? labels.resume : labels.pause);
    btn.title = paused ? labels.resume : labels.pause;
  };
  btn.addEventListener('click', () => motion.toggle());
  motion.onChange(sync);
  sync();
}
