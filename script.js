// The slab tilts gently toward the pointer and a light sheen slides across the case.
// Only on devices with a real pointer, and never when the visitor asks for reduced motion.
const slab = document.querySelector(".slab");
const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

if (slab && fine.matches && !calm.matches) {
  let frame = 0;
  const stage = slab.closest(".stage");

  stage.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = slab.getBoundingClientRect();
      const x = (event.clientX - (box.left + box.width / 2)) / box.width;
      const y = (event.clientY - (box.top + box.height / 2)) / box.height;
      const cx = Math.max(-1, Math.min(1, x));
      const cy = Math.max(-1, Math.min(1, y));
      slab.style.transform = `perspective(1400px) rotateY(${cx * 5}deg) rotateX(${cy * -4}deg)`;
      slab.style.setProperty("--sheen", `${50 - cx * 70}%`);
    });
  });

  stage.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    slab.style.transform = "";
    slab.style.removeProperty("--sheen");
  });
}

// Bookbell's screens in English or Romanian. Each screenshot carries its Romanian
// picture and description in data-ro-src / data-ro-alt; the English ones are kept
// the first time we swap. The switch is hidden in the HTML so it only shows when this runs.
const langPick = document.querySelector(".lang-pick");

if (langPick) {
  const shots = [...document.querySelectorAll("#bookbell .insert img[data-ro-src]")];
  for (const img of shots) {
    img.dataset.enSrc = img.getAttribute("src");
    img.dataset.enAlt = img.getAttribute("alt");
  }
  const buttons = [...langPick.querySelectorAll("button[data-lang]")];

  const show = (lang) => {
    for (const img of shots) {
      img.src = img.dataset[`${lang}Src`];
      img.alt = img.dataset[`${lang}Alt`];
    }
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  };

  for (const b of buttons) b.addEventListener("click", () => show(b.dataset.lang));

  // Fetch the Romanian pictures early when the visitor heads for the switch, so the swap is instant.
  langPick.addEventListener("pointerenter", () => {
    for (const img of shots) new Image().src = img.dataset.roSrc;
  }, { once: true });

  langPick.hidden = false;
}

// The launch film plays, muted, while at least half of it is on screen, and pauses when it leaves.
// If the visitor pauses it themselves, it stays paused. Reduced motion: no autoplay, just the play button.
const film = document.querySelector(".film-video");

if (film && "IntersectionObserver" in window && !calm.matches) {
  let pausedByVisitor = false;
  let pausingForScroll = false;

  film.addEventListener("pause", () => {
    if (pausingForScroll) pausingForScroll = false;
    else if (!film.ended) pausedByVisitor = true;
  });
  film.addEventListener("play", () => { pausedByVisitor = false; });

  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        if (!pausedByVisitor && film.paused && !film.ended) {
          film.muted = true;
          film.play().catch(() => {}); // a browser that blocks autoplay just keeps the play button
        }
      } else if (!film.paused) {
        pausingForScroll = true;
        film.pause();
      }
    }
  }, { threshold: 0.5 }).observe(film);
}
