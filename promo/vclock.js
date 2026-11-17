// Injected before page scripts during promo capture. While __vclock.on is false the page runs on
// real time; once on, performance.now/Date.now/requestAnimationFrame only advance when the
// capture script calls __step(ms), so every captured frame is exactly 1/30 s of page time.
(() => {
  const realNow = performance.now.bind(performance);
  const realDate = Date.now;
  const realRaf = window.requestAnimationFrame.bind(window);
  const realCancel = window.cancelAnimationFrame.bind(window);
  const clock = { on: false, now: realNow() };
  const queue = new Map();
  let nextId = 1e9;

  window.__vclock = clock;
  performance.now = () => (clock.on ? clock.now : realNow());
  const dateOffset = realDate() - realNow();
  Date.now = () => Math.round(dateOffset + performance.now());

  window.requestAnimationFrame = (cb) => {
    if (!clock.on) return realRaf(cb);
    const id = nextId++;
    queue.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (queue.delete(id)) return;
    realCancel(id);
  };

  window.__startClock = () => {
    clock.now = realNow();
    clock.on = true;
  };
  // Advance page time and run one animation frame's worth of callbacks.
  window.__step = (ms) => {
    clock.now += ms;
    const due = [...queue.values()];
    queue.clear();
    for (const cb of due) {
      try {
        cb(clock.now);
      } catch (err) {
        console.error(err);
      }
    }
  };
})();
