// One small celebration when a student finishes a key action (quiz summary). The badge pops, a few
// accent dots burst out once, and the supporting copy rises in. Keyframes live in assets/theme.css;
// with reduced motion nothing animates and the content is simply there.

const DOT_COUNT = 10;
const DOT_CLASSES = ["bg-primary-600", "bg-primary-300", "bg-neutral-300"];
const DISTANCE_PX = 44;
const CLEANUP_MS = 900;

let done = false;

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function burst(badge) {
  for (let i = 0; i < DOT_COUNT; i += 1) {
    const angle = (i / DOT_COUNT) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2);
    const distance = DISTANCE_PX + (i % 3) * 8;
    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    dot.setAttribute("data-celebrate-dot", "");
    dot.className = `pointer-events-none absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full ${DOT_CLASSES[i % DOT_CLASSES.length]}`;
    dot.style.setProperty("--dx", `${Math.round(Math.cos(angle) * distance)}px`);
    dot.style.setProperty("--dy", `${Math.round(Math.sin(angle) * distance)}px`);
    dot.style.animationDelay = `${120 + (i % 3) * 30}ms`;
    badge.append(dot);
  }
  setTimeout(() => badge.querySelectorAll("[data-celebrate-dot]").forEach((dot) => dot.remove()), CLEANUP_MS);
}

/** Celebrate the first visible [data-celebrate] block, once per page view. */
export function celebrate(root = document.body) {
  if (done) return false;
  const block = [...root.querySelectorAll("[data-celebrate]")].find((el) => !el.closest("[hidden]"));
  if (!block) return false;
  done = true;
  if (prefersReducedMotion()) return true;
  block.classList.add("is-celebrating");
  const badge = block.querySelector("[data-celebrate-badge]");
  if (badge) burst(badge);
  return true;
}

/** Celebrate when the page reaches (or switches to) a state that shows a [data-celebrate] block. */
export function bindCelebration(root = document.body) {
  document.addEventListener("prototype:state", () => requestAnimationFrame(() => celebrate(root)));
}

/** Tests only. */
export function resetCelebration() {
  done = false;
}
