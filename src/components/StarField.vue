<script setup>
// A fixed, faintly twinkling star field behind the page, matching the link-preview image.
// Positions are percentages and radii are pixels, so stars stay the same size on any screen.

// Deterministic randomness so the sky looks the same on every visit.
let seed = 11
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32

const stars = Array.from({ length: 120 }, (_, i) => ({
  x: `${(rand() * 100).toFixed(2)}%`,
  y: `${(rand() * 100).toFixed(2)}%`,
  r: +(rand() * 1.2 + 0.4).toFixed(2),
  opacity: +(rand() * 0.45 + 0.15).toFixed(2),
  twinkle: rand() < 0.5,
  duration: `${(2.5 + rand() * 4).toFixed(1)}s`,
  // Negative delays start each twinkle partway through, so they don't pulse in sync.
  delay: `${(-rand() * 8).toFixed(1)}s`,
  warm: i % 9 === 0,
  // Every other star is dropped on narrow screens to keep the density even.
  wideOnly: i % 2 === 1,
}))
</script>

<template>
  <svg class="starfield" aria-hidden="true">
    <circle
      v-for="(s, i) in stars"
      :key="i"
      :cx="s.x"
      :cy="s.y"
      :r="s.r"
      :fill="s.warm ? '#f6e2a8' : '#ffffff'"
      :class="{ 'star--twinkle': s.twinkle, 'star--wide': s.wideOnly }"
      :style="{ opacity: s.opacity, '--o': s.opacity, '--duration': s.duration, '--delay': s.delay }"
    />
  </svg>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star--twinkle {
  transform-box: fill-box;
  transform-origin: center;
  animation: twinkle var(--duration) ease-in-out var(--delay) infinite;
}

/* Each twinkling star dims well below its resting brightness, then flares and swells. */
@keyframes twinkle {
  0%,
  100% {
    opacity: calc(var(--o) * 0.3);
    transform: scale(0.9);
  }
  50% {
    opacity: min(1, calc(var(--o) * 1.5));
    transform: scale(1.25);
  }
}

@media (max-width: 700px) {
  .star--wide {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .star--twinkle {
    animation: none;
  }
}
</style>
