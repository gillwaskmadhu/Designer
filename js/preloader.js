(() => {
  const root = document.getElementById("preloader");
  const text = document.getElementById("preloader-text");
  const skipBtn = document.getElementById("preloader-skip");
  const content = root?.querySelector(".preloader__content");

  // Timed intro over the main canvas fire (no video)
  const HOLD_MS = 3200;
  const FADE_MS = 1400;
  const EXIT_MS = 700;

  const finish = () => {
    if (!root || root.classList.contains("is-done")) return;
    root.classList.add("is-fading");

    window.setTimeout(() => {
      root.classList.add("is-done");
      document.body.classList.remove("is-preloading");
      document.body.classList.add("is-site-ready");
      root.remove();
    }, EXIT_MS);
  };

  if (!root) {
    document.body.classList.remove("is-preloading");
    document.body.classList.add("is-site-ready");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    finish();
    return;
  }

  let finished = false;
  const safeFinish = () => {
    if (finished) return;
    finished = true;
    if (content) {
      content.style.opacity = "0";
      content.style.pointerEvents = "none";
    }
    finish();
  };

  skipBtn?.addEventListener("click", safeFinish);

  // Hold readable, then dissolve text + skip over the fire
  window.setTimeout(() => {
    if (finished) return;
    const start = performance.now();

    const tick = (now) => {
      if (finished) return;
      const t = Math.min((now - start) / FADE_MS, 1);
      const opacity = 1 - t;

      if (content) {
        content.style.opacity = String(opacity);
        content.style.pointerEvents = opacity < 0.15 ? "none" : "auto";
      } else if (text) {
        text.style.opacity = String(opacity);
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        safeFinish();
      }
    };

    requestAnimationFrame(tick);
  }, HOLD_MS);

  // Safety net
  window.setTimeout(safeFinish, HOLD_MS + FADE_MS + 4000);
})();
