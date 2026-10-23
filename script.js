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
