(() => {
  // Always start at the top on reload (disable browser scroll restore)
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  if (typeof Lenis === "undefined") {
    console.warn("Lenis failed to load");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lenis = new Lenis({
    autoRaf: true,
    anchors: true,
    allowNestedScroll: true,
    syncTouch: false,
    lerp: reduceMotion ? 1 : 0.1,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
  });

  lenis.scrollTo(0, { immediate: true });

  let snap = null;

  if (typeof Snap !== "undefined" && !reduceMotion) {
    snap = new Snap(lenis, {
      type: "mandatory",
      debounce: 80,
      duration: 1.05,
    });

    const panels = [...document.querySelectorAll(".panel")];
    panels.forEach((panel) => {
      // Tall experience section: snap only at enter/exit so the pin scroll stays free
      if (panel.id === "experience") {
        snap.addElement(panel, { align: ["start", "end"] });
        return;
      }
      snap.addElement(panel, { align: "start" });
    });
  }

  const syncExperienceSnap = () => {
    const section = document.getElementById("experience");
    if (!section || !snap) return;

    const rect = section.getBoundingClientRect();
    const inPinnedScroll =
      rect.top < -24 && rect.bottom > window.innerHeight + 24;

    document.documentElement.classList.toggle("is-free-scroll", inPinnedScroll);

    if (inPinnedScroll) {
      snap.stop();
    } else {
      snap.start();
    }
  };

  lenis.on("scroll", syncExperienceSnap);

  // Pause smooth scroll while the video preloader is up
  if (document.body.classList.contains("is-preloading")) {
    lenis.stop();
  }

  const unlock = () => {
    if (!document.body.classList.contains("is-preloading")) {
      lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      lenis.start();
      lenis.resize();
      snap?.resize();
    }
  };

  const readyObserver = new MutationObserver(unlock);
  readyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.__lenis = lenis;
  window.__lenisSnap = snap;

  window.addEventListener("resize", () => {
    lenis.resize();
    snap?.resize();
    syncExperienceSnap();
  });

  // Cover bfcache / back-forward reload cases
  window.addEventListener("pageshow", () => {
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  });
})();
