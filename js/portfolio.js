(() => {
  const data = window.PORTFOLIO;
  if (!data) return;

  const isPlaceholder = (value) =>
    typeof value === "string" && value.includes("[PLACEHOLDER:");

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderText = (value) => {
    if (!value) return "";
    const text = escapeHtml(value);
    return isPlaceholder(value)
      ? `<span class="placeholder-note">${text}</span>`
      : text;
  };

  const listItems = (items = []) => {
    if (!items.length) return "";
    return `<ul>${items.map((item) => `<li>${renderText(item)}</li>`).join("")}</ul>`;
  };

  const groupBlock = (title, items) => {
    if (!items || !items.length) return "";
    return `
      <div class="timeline-entry__group">
        <h4>${escapeHtml(title)}</h4>
        ${listItems(items)}
      </div>
    `;
  };

  const renderExperience = () => {
    const root = document.getElementById("experience-list");
    const stepper = document.getElementById("experience-stepper");
    const section = document.getElementById("experience");
    if (!root) return;

    const jobs = data.experience || [];
    if (section) {
      section.style.setProperty("--experience-steps", String(Math.max(jobs.length, 1)));
    }

    root.innerHTML = jobs
      .map(
        (job, index) => `
      <li class="timeline-entry${index === 0 ? " is-active" : ""}" data-index="${index}">
        <span class="timeline-entry__dot" aria-hidden="true"></span>
        <div class="timeline-entry__meta">
          <span class="timeline-entry__company">${escapeHtml(job.company)}</span>
          <span>${escapeHtml(job.duration)}</span>
          ${
            job.location && !isPlaceholder(job.location)
              ? `<span>${escapeHtml(job.location)}</span>`
              : ""
          }
        </div>
        <h3>${escapeHtml(job.title)}</h3>
        <div class="timeline-entry__body">
          ${groupBlock("Responsibilities", job.responsibilities)}
          ${groupBlock("Key contributions", job.contributions)}
          ${groupBlock("Achievements", job.achievements)}
          ${
            job.technologies?.length
              ? `<div class="timeline-entry__group">
                  <h4>Technologies</h4>
                  <div class="chip-row">${job.technologies
                    .map((tech) => `<span>${escapeHtml(tech)}</span>`)
                    .join("")}</div>
                </div>`
              : ""
          }
        </div>
      </li>
    `
      )
      .join("");

    if (stepper) {
      stepper.innerHTML = jobs
        .map(
          (_, index) =>
            `<span class="${index === 0 ? "is-active" : ""}" data-index="${index}"></span>`
        )
        .join("");
    }
  };

  const initExperienceScroll = () => {
    const section = document.getElementById("experience");
    const entries = [...document.querySelectorAll("#experience-list .timeline-entry")];
    const steps = [...document.querySelectorAll("#experience-stepper span")];
    if (!section || !entries.length) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      section.classList.add("is-static-experience");
      entries.forEach((entry) => entry.classList.add("is-active"));
      return;
    }

    let activeIndex = 0;

    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      entries.forEach((entry, i) => {
        entry.classList.toggle("is-active", i === index);
      });
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
      });
    };

    const updateFromScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const inPinnedScroll =
        rect.top < -24 && rect.bottom > window.innerHeight + 24;

      document.documentElement.classList.toggle("is-free-scroll", inPinnedScroll);

      if (total <= 0) {
        setActive(0);
        return;
      }

      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const index = Math.min(
        entries.length - 1,
        Math.floor(progress * entries.length)
      );
      setActive(index);
    };

    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    updateFromScroll();
  };

  const renderEducation = () => {
    const root = document.getElementById("education-list");
    if (!root) return;

    const items = data.foundation || [];
    const cross = root.closest(".foundation-cross");
    if (cross) {
      cross.dataset.count = String(items.length);
    }

    root.innerHTML = items
      .map(
        (item, index) => `
      <article class="foundation-cell" data-index="${index}">
        <div class="foundation-cell__inner">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </article>
    `
      )
      .join("");
  };

  const renderSkills = () => {
    const root = document.getElementById("skills-list");
    if (!root) return;

    root.innerHTML = data.skills
      .map(
        (group) => `
      <article class="element-block">
        <h3>${escapeHtml(group.category)}</h3>
        <div class="tag-row">
          ${group.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </article>
    `
      )
      .join("");
  };

  const projectLiveButton = (href) => {
    if (!href || isPlaceholder(href)) {
      return `<span class="cta is-disabled" aria-disabled="true">View project</span>`;
    }
    return `<a class="cta" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">View project <span aria-hidden="true">→</span></a>`;
  };

  const readableCopy = (value, fallback) => {
    if (!value || isPlaceholder(value)) return fallback;
    return value;
  };

  const renderProjects = () => {
    const root = document.getElementById("projects-list");
    const dots = document.getElementById("projects-dots");
    if (!root) return;

    root.innerHTML = data.projects
      .map((project, index) => {
        const tags = [project.category, ...(project.technologies || [])]
          .filter(Boolean)
          .slice(0, 3);
        const about = readableCopy(project.description, "Project details coming soon.");
        const solution = readableCopy(
          project.solution,
          readableCopy(project.approach, "Solution details coming soon.")
        );
        const media = project.thumbnail
          ? project.mediaScroll
            ? `<div class="device-imac" aria-hidden="true">
                <div class="device-imac__stage">
                  <div class="device-imac__screen">
                    <img class="device-imac__page" src="${escapeHtml(project.thumbnail)}" alt="">
                  </div>
                  <img class="device-imac__frame" src="images/projects/imac.svg" alt="">
                </div>
              </div>`
            : `<img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.title)} preview">`
          : `<div class="case-card__media-fallback">
              <span>${escapeHtml(project.category || "Project")}</span>
              <em>Preview pending</em>
            </div>`;

        return `
        <article class="case-slide" data-index="${index}" aria-roledescription="slide" aria-label="${index + 1} of ${data.projects.length}">
          <div class="case-card">
            <div class="case-card__copy">
              <h3>${escapeHtml(project.title)}</h3>
              <div class="case-card__tags">
                ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              </div>
              <div class="case-card__block">
                <strong>About:</strong>
                <p>${escapeHtml(about)}</p>
              </div>
              <div class="case-card__block">
                <strong>Solution:</strong>
                <p>${renderText(solution)}</p>
              </div>
              ${
                project.liveUrl && !isPlaceholder(project.liveUrl)
                  ? `<div class="case-card__links">${projectLiveButton(project.liveUrl)}</div>`
                  : ""
              }
            </div>
            <div class="case-card__media${project.mediaScroll ? " case-card__media--imac" : ""}">${media}</div>
          </div>
        </article>
      `;
      })
      .join("");

    if (dots) {
      dots.innerHTML = data.projects
        .map(
          (_, index) =>
            `<button type="button" aria-label="Go to project ${index + 1}" data-index="${index}"></button>`
        )
        .join("");
    }
  };

  const initCasesSlider = () => {
    const track = document.getElementById("projects-list");
    const slider = document.getElementById("projects-slider");
    const prev = document.getElementById("cases-prev");
    const next = document.getElementById("cases-next");
    const dots = document.getElementById("projects-dots");
    const section = document.getElementById("projects");
    const slides = [...(track?.querySelectorAll(".case-slide") || [])];

    if (!track || !slider || !slides.length) return;

    let index = 0;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;
    let timer = null;
    const AUTO_MS = 4500;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const clamp = (value) => Math.max(0, Math.min(slides.length - 1, value));

    const goTo = (nextIndex, { soft = false } = {}) => {
      if (soft && nextIndex >= slides.length) {
        index = 0;
      } else if (soft && nextIndex < 0) {
        index = slides.length - 1;
      } else {
        index = clamp(nextIndex);
      }

      track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

      dots?.querySelectorAll("button").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-selected", String(dotIndex === index));
      });
    };

    const stopAuto = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const startAuto = () => {
      if (reduceMotion || slides.length < 2) return;
      stopAuto();
      timer = setInterval(() => {
        goTo(index + 1, { soft: true });
      }, AUTO_MS);
    };

    const manualGo = (nextIndex) => {
      goTo(nextIndex, { soft: true });
      startAuto();
    };

    prev?.addEventListener("click", () => manualGo(index - 1));
    next?.addEventListener("click", () => manualGo(index + 1));

    dots?.querySelectorAll("button").forEach((dot) => {
      dot.addEventListener("click", () => manualGo(Number(dot.dataset.index)));
    });

    slider.addEventListener(
      "touchstart",
      (event) => {
        dragging = true;
        stopAuto();
        startX = event.touches[0].clientX;
        deltaX = 0;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (event) => {
        if (!dragging) return;
        deltaX = event.touches[0].clientX - startX;
      },
      { passive: true }
    );

    slider.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(deltaX) > 50) {
        manualGo(index + (deltaX < 0 ? 1 : -1));
      } else {
        startAuto();
      }
    });

    const pauseTarget = section || slider;
    pauseTarget.addEventListener("mouseenter", stopAuto);
    pauseTarget.addEventListener("mouseleave", startAuto);
    pauseTarget.addEventListener("focusin", stopAuto);
    pauseTarget.addEventListener("focusout", (event) => {
      if (!pauseTarget.contains(event.relatedTarget)) startAuto();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    window.addEventListener("resize", () => goTo(index));
    goTo(0);
    startAuto();
  };

  const renderPhilosophy = () => {
    const root = document.getElementById("philosophy-list");
    if (!root) return;

    root.innerHTML = data.philosophy
      .map(
        (item, index) => `
      <article class="craft-item">
        <span class="craft-item__count" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </article>
    `
      )
      .join("");
  };

  const renderBeyond = () => {
    const root = document.getElementById("beyond-list");
    if (!root) return;

    root.innerHTML = data.beyond
      .map(
        (item) => `
      <article class="evolution-card">
        <h3>${escapeHtml(item.title)}</h3>
        <ul class="evolution-card__list">
          ${(item.items || [])
            .map((entry) => `<li>${escapeHtml(entry)}</li>`)
            .join("")}
        </ul>
      </article>
    `
      )
      .join("");
  };

  const renderContact = () => {
    const root = document.getElementById("contact-block");
    if (!root) return;

    const email = data.contact?.email || "";
    const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

    root.innerHTML = `
      <div class="cta-row">
        <a class="cta" href="${escapeHtml(gmailHref)}" target="_blank" rel="noopener noreferrer">
          Start a conversation <span aria-hidden="true">→</span>
        </a>
      </div>
    `;
  };

  const renderFooter = () => {
    // Final Ember section removed — keep as no-op for boot safety
  };

  const createEmbers = () => {
    const layer = document.getElementById("embers");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!layer || reduceMotion) {
      return;
    }

    const count = window.innerWidth < 720 ? 12 : 22;
    for (let i = 0; i < count; i += 1) {
      const ember = document.createElement("span");
      ember.className = "ember-particle";
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.setProperty("--drift", `${(Math.random() * 80 - 40).toFixed(1)}px`);
      ember.style.animationDuration = `${(8 + Math.random() * 10).toFixed(1)}s`;
      ember.style.animationDelay = `${(-Math.random() * 12).toFixed(1)}s`;
      ember.style.width = ember.style.height = `${(2 + Math.random() * 3).toFixed(1)}px`;
      layer.appendChild(ember);
    }
  };

  const initNavigation = () => {
    const panels = [...document.querySelectorAll(".panel")];
    const links = [...document.querySelectorAll(".nav a")];
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav-toggle");

    if (!panels.length) return;

    const closeMenu = () => {
      if (!nav || !toggle) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    const setActive = (id) => {
      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === id);
      });
      links.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.section === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.25, 0.45, 0.65],
      }
    );

    panels.forEach((panel) => observer.observe(panel));
    setActive(panels[0].id);

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });

      links.forEach((link) => {
        link.addEventListener("click", (event) => {
          closeMenu();
          const targetId = link.getAttribute("href")?.replace("#", "");
          const target = targetId ? document.getElementById(targetId) : null;
          if (target && window.__lenis) {
            event.preventDefault();
            window.__lenis.scrollTo(target, { offset: 0, duration: 1.15 });
          }
        });
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 720) closeMenu();
      });
    }
  };

  const initFlameScroll = () => {
    const button = document.getElementById("flame-scroll");
    const panels = [...document.querySelectorAll(".panel")];
    if (!button || !panels.length) return;

    const getCurrentIndex = () => {
      const mid = window.innerHeight * 0.35;
      let bestIndex = 0;
      let bestDistance = Infinity;

      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const distance = Math.abs(rect.top - mid);
        if (rect.bottom > 0 && rect.top < window.innerHeight && distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    };

    const updateButton = () => {
      const index = getCurrentIndex();
      const isLast = index >= panels.length - 1;
      button.classList.toggle("is-top", isLast);
      button.setAttribute(
        "aria-label",
        isLast ? "Back to top" : "Scroll to next section"
      );
    };

    const scrollToPanel = (panel) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(panel, { offset: 0, duration: 1.1 });
        return;
      }
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    button.addEventListener("click", () => {
      const index = getCurrentIndex();
      if (index >= panels.length - 1) {
        scrollToPanel(panels[0]);
        return;
      }
      scrollToPanel(panels[index + 1]);
    });

    const onScroll = () => updateButton();
    if (window.__lenis) {
      window.__lenis.on("scroll", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", updateButton);
    updateButton();
  };

  const boot = () => {
    try {
      if (data.meta?.siteTitle) {
        document.title = data.meta.siteTitle;
      }

      renderExperience();
      renderEducation();
      renderSkills();
      renderProjects();
      renderPhilosophy();
      renderBeyond();
      renderContact();
      renderFooter();
      createEmbers();
      initNavigation();
      initCasesSlider();
      initExperienceScroll();
      initFlameScroll();
    } catch (error) {
      console.error("Portfolio boot failed:", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
