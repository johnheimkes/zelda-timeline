<script setup>
// Original "ancient technology" patterns (circuit traces, segmented rings, hex panels) that
// drift slowly up behind the page, glowing in the current era's accent color.
// Every pattern is a geometric design made for this site.

// Patterns live in a 48x48 box: stroke paths, optional rings around the center, and node dots.
const PATTERNS = [
  {
    // Circuit node: a dashed ring with four traces ending in nodes.
    paths: ['M24 12 V3 M24 36 V45 M36 24 H45 M12 24 H3'],
    rings: [{ r: 6 }, { r: 12, dash: '4 3' }],
    dots: [[24, 3], [24, 45], [45, 24], [3, 24]],
  },
  {
    // Stepped trace between two nodes.
    paths: ['M4 40 H16 L24 32 V16 L32 8 H44', 'M24 24 H31'],
    dots: [[4, 40], [44, 8], [31, 24]],
  },
  {
    // Nested hex panels.
    paths: ['M24 4 L41 14 V34 L24 44 L7 34 V14 Z', 'M24 14 L32 19 V29 L24 34 L16 29 V19 Z'],
    dots: [[24, 24]],
  },
  {
    // Segmented ring with two traces running out to nodes.
    paths: ['M24 15 V2', 'M33 24 H46'],
    rings: [{ r: 18, dash: '22 6' }, { r: 9 }],
    dots: [[24, 2], [46, 24], [24, 24]],
  },
  {
    // Double arched gate on a base line.
    paths: ['M10 40 V18 A14 14 0 0 1 38 18 V40', 'M16 40 V22 A8 8 0 0 1 32 22 V40', 'M6 40 H42'],
    dots: [[24, 10]],
  },
  {
    // A trace that splits into three, like the site's timeline mark.
    paths: ['M24 44 V28', 'M24 28 L12 16 V6', 'M24 28 L36 16 V6', 'M24 28 V8'],
    dots: [[12, 6], [36, 6], [24, 8], [24, 44], [24, 28]],
  },
  {
    // Dotted ring with cardinal ticks.
    paths: ['M24 2 V8 M24 40 V46 M2 24 H8 M40 24 H46'],
    rings: [{ r: 16, dash: '2 4' }, { r: 6 }],
  },
  {
    // Diamond lattice with side traces.
    paths: ['M24 4 L44 24 L24 44 L4 24 Z', 'M24 14 L34 24 L24 34 L14 24 Z', 'M4 24 H14 M34 24 H44'],
    dots: [[24, 24]],
  },
  {
    // Gateway circuit: two posts, a crossbeam and a trace up from the lintel.
    paths: ['M14 44 V14 H34 V44', 'M14 26 H34', 'M24 14 V4'],
    dots: [[24, 4], [14, 44], [34, 44], [24, 26]],
  },
  {
    // Panel with a corner circuit.
    paths: ['M6 6 H42 V42 H6 Z', 'M6 18 H18 V6', 'M42 30 H30 V42', 'M18 18 L30 30'],
    dots: [[18, 18], [30, 30]],
  },
]

// Deterministic randomness so the layout is the same on every visit.
let seed = 29
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32

const runes = Array.from({ length: 12 }, (_, i) => {
  const duration = 57 + rand() * 45
  return {
    ...PATTERNS[i % PATTERNS.length],
    x: `${(3 + rand() * 90).toFixed(1)}%`,
    size: `${Math.round(38 + rand() * 30)}px`,
    opacity: (0.2 + rand() * 0.25).toFixed(2),
    duration: `${duration.toFixed(1)}s`,
    // Negative delays spread the patterns across the screen from the first frame.
    delay: `${(-rand() * duration).toFixed(1)}s`,
    spinFrom: `${Math.round(-15 + rand() * 30)}deg`,
    spinTo: `${Math.round(-15 + rand() * 30)}deg`,
    // Resting height when motion is reduced.
    restY: `${Math.round(8 + rand() * 80)}vh`,
    // Every other pattern is dropped on narrow screens.
    wideOnly: i % 2 === 1,
  }
})
</script>

<template>
  <div class="runefield" aria-hidden="true">
    <svg
      v-for="(r, i) in runes"
      :key="i"
      class="rune"
      :class="{ 'rune--wide': r.wideOnly }"
      viewBox="-2 -2 52 52"
      :style="{
        left: r.x,
        width: r.size,
        height: r.size,
        '--o': r.opacity,
        '--duration': r.duration,
        '--delay': r.delay,
        '--spin-from': r.spinFrom,
        '--spin-to': r.spinTo,
        '--rest-y': r.restY,
      }"
    >
      <circle
        v-for="(ring, j) in r.rings ?? []"
        :key="`ring-${j}`"
        cx="24"
        cy="24"
        :r="ring.r"
        :stroke-dasharray="ring.dash"
      />
      <path v-for="(d, j) in r.paths" :key="`path-${j}`" :d="d" />
      <circle v-for="(dot, j) in r.dots ?? []" :key="`dot-${j}`" class="rune__node" :cx="dot[0]" :cy="dot[1]" r="2.2" />
    </svg>
  </div>
</template>

<style scoped>
.runefield {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.rune {
  position: absolute;
  top: 0;
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgb(var(--v-theme-primary)));
  opacity: 0;
  animation: rune-drift var(--duration) linear var(--delay) infinite;
  transition: stroke var(--era-fade);
}

.rune__node {
  fill: rgb(var(--v-theme-primary));
  stroke: none;
  transition: fill var(--era-fade);
}

/* Rise from below the screen to above it, fading in and out and slowly turning. */
@keyframes rune-drift {
  0% {
    transform: translateY(105vh) rotate(var(--spin-from));
    opacity: 0;
  }
  12%,
  85% {
    opacity: var(--o);
  }
  100% {
    transform: translateY(-14vh) rotate(var(--spin-to));
    opacity: 0;
  }
}

@media (max-width: 700px) {
  .rune--wide {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rune {
    animation: none;
    opacity: calc(var(--o) * 0.7);
    transform: translateY(var(--rest-y)) rotate(var(--spin-from));
  }
}
</style>
