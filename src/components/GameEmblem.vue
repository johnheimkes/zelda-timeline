<script setup>
import { computed } from 'vue'

// Original abstract artwork for each game, drawn from its motif and era palette.
// To use your own picture instead, add src/assets/games/<slug>.(jpg|png|webp).
const customImages = import.meta.glob('../assets/games/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const props = defineProps({
  game: { type: Object, required: true },
  colors: { type: Object, required: true },
})

const customSrc = computed(() => {
  const match = Object.entries(customImages).find(([path]) =>
    path.split('/').pop().startsWith(`${props.game.slug}.`),
  )
  return match?.[1]
})

const uid = computed(() => `emblem-${props.game.slug}`)

// Deterministic "random" stars so each game gets its own sky.
const stars = computed(() => {
  let seed = [...props.game.slug].reduce((n, c) => n * 31 + c.charCodeAt(0), 7) >>> 0
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return Array.from({ length: 28 }, () => ({
    x: rand() * 400,
    y: rand() * 140,
    r: rand() * 1.3 + 0.3,
    o: rand() * 0.6 + 0.2,
  }))
})

const wave = (y, amp, phase) => {
  let d = `M0 ${y}`
  for (let x = 0; x <= 400; x += 10) d += ` L${x} ${y + Math.sin(x / 32 + phase) * amp}`
  return d
}
</script>

<template>
  <v-img v-if="customSrc" :src="customSrc" :alt="game.title" aspect-ratio="16/9" cover />
  <svg
    v-else
    class="emblem"
    viewBox="0 0 400 225"
    role="img"
    :aria-label="`${game.title} emblem`"
  >
    <defs>
      <linearGradient :id="`${uid}-bg`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="colors.background" />
        <stop offset="1" :stop-color="colors.glow" />
      </linearGradient>
      <radialGradient :id="`${uid}-halo`" cx="0.5" cy="0.55" r="0.5">
        <stop offset="0" :stop-color="colors.primary" stop-opacity="0.45" />
        <stop offset="1" :stop-color="colors.primary" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect width="400" height="225" :fill="`url(#${uid}-bg)`" />
    <circle
      v-for="(s, i) in stars"
      :key="i"
      :cx="s.x"
      :cy="s.y"
      :r="s.r"
      :fill="colors.secondary"
      :opacity="s.o"
    />
    <ellipse cx="200" cy="120" rx="170" ry="110" :fill="`url(#${uid}-halo)`" />

    <g :stroke="colors.primary" :fill="colors.primary" stroke-width="3" stroke-linecap="round">
      <template v-if="game.motif === 'clouds'">
        <ellipse cx="200" cy="105" rx="40" ry="14" :fill="colors.secondary" opacity="0.9" />
        <rect x="185" y="75" width="30" height="30" rx="4" :fill="colors.secondary" opacity="0.9" />
        <g fill="#fff" stroke="none" opacity="0.8">
          <ellipse cx="90" cy="170" rx="70" ry="20" />
          <ellipse cx="140" cy="160" rx="50" ry="22" />
          <ellipse cx="300" cy="175" rx="80" ry="20" />
          <ellipse cx="260" cy="165" rx="45" ry="20" />
        </g>
      </template>

      <template v-else-if="game.motif === 'leaf'">
        <path d="M200 50 C260 80 260 150 200 185 C140 150 140 80 200 50 Z" opacity="0.85" />
        <path d="M200 60 L200 180" :stroke="colors.background" />
        <circle cx="290" cy="170" r="5" :fill="colors.secondary" stroke="none" />
        <circle cx="305" cy="160" r="3" :fill="colors.secondary" stroke="none" />
      </template>

      <template v-else-if="game.motif === 'split'">
        <rect
          v-for="(c, i) in ['#7bd36a', '#ef5350', '#5c9cff', '#b48cf2']"
          :key="c"
          :x="122 + i * 42"
          y="85"
          width="36"
          height="36"
          :fill="c"
          stroke="none"
          :transform="`rotate(45 ${140 + i * 42} 103)`"
          opacity="0.9"
        />
      </template>

      <template v-else-if="game.motif === 'hourglass'">
        <path d="M160 50 L240 50 L200 112 Z M160 175 L240 175 L200 113 Z" fill="none" />
        <path d="M178 160 L222 160 L200 128 Z" :fill="colors.secondary" stroke="none" />
        <path d="M150 50 L250 50 M150 175 L250 175" :stroke="colors.secondary" stroke-width="5" />
      </template>

      <template v-else-if="game.motif === 'mirror'">
        <circle cx="200" cy="80" r="34" fill="none" />
        <path d="M120 120 L280 120" :stroke="colors.secondary" />
        <circle cx="200" cy="160" r="34" fill="none" opacity="0.4" stroke-dasharray="6 6" />
      </template>

      <template v-else-if="game.motif === 'seasons'">
        <path d="M200 112 L200 52 A60 60 0 0 1 260 112 Z" fill="#7bd36a" stroke="none" />
        <path d="M200 112 L260 112 A60 60 0 0 1 200 172 Z" fill="#f0cc6b" stroke="none" />
        <path d="M200 112 L200 172 A60 60 0 0 1 140 112 Z" fill="#e07b39" stroke="none" />
        <path d="M200 112 L140 112 A60 60 0 0 1 200 52 Z" fill="#cfe8ff" stroke="none" />
      </template>

      <template v-else-if="game.motif === 'egg'">
        <ellipse cx="200" cy="105" rx="42" ry="55" :fill="colors.secondary" stroke="none" />
        <path :d="wave(185, 5, 0)" fill="none" />
        <path :d="wave(200, 4, 1.5)" fill="none" opacity="0.6" />
      </template>

      <template v-else-if="game.motif === 'rift'">
        <path
          d="M120 60 L160 90 L140 110 L200 140 L180 160 L270 185 L240 150 L265 130 L215 105 L235 85 L170 55 Z"
          :fill="colors.background"
          :stroke="colors.primary"
        />
        <rect x="290" y="70" width="22" height="22" :fill="colors.secondary" stroke="none" opacity="0.8" />
        <rect x="90" y="150" width="16" height="16" :fill="colors.secondary" stroke="none" opacity="0.6" />
      </template>

      <template v-else-if="game.motif === 'mountains'">
        <path
          d="M20 190 L110 90 L160 140 L230 60 L310 150 L350 115 L390 190 Z"
          :fill="colors.background"
        />
        <circle cx="320" cy="60" r="16" :fill="colors.secondary" stroke="none" />
      </template>

      <template v-else-if="game.motif === 'sword'">
        <path d="M200 40 L212 60 L212 145 L188 145 L188 60 Z" :fill="colors.secondary" stroke="none" />
        <path d="M165 148 L235 148" stroke-width="8" />
        <path d="M200 152 L200 185" stroke-width="8" />
      </template>

      <template v-else-if="game.motif === 'moon'">
        <circle cx="200" cy="95" r="62" :fill="colors.secondary" stroke="none" opacity="0.85" />
        <circle cx="178" cy="80" r="10" :fill="colors.background" stroke="none" opacity="0.35" />
        <circle cx="222" cy="112" r="14" :fill="colors.background" stroke="none" opacity="0.35" />
        <path d="M60 205 L120 175 L170 195 L240 170 L320 200 L380 180 L380 225 L60 225 Z" :fill="colors.background" stroke="none" />
      </template>

      <template v-else-if="game.motif === 'twilight'">
        <rect
          v-for="i in 18"
          :key="i"
          :x="110 + ((i * 47) % 180)"
          :y="40 + ((i * 29) % 130)"
          :width="6 + (i % 4) * 3"
          :height="6 + (i % 4) * 3"
          :fill="i % 3 ? colors.primary : colors.secondary"
          stroke="none"
          :opacity="0.4 + (i % 5) * 0.12"
        />
        <path :d="wave(190, 6, 0.4)" fill="none" :stroke="colors.secondary" />
      </template>

      <template v-else-if="game.motif === 'waves'">
        <circle cx="200" cy="80" r="30" :fill="colors.secondary" stroke="none" />
        <path :d="wave(140, 8, 0)" fill="none" />
        <path :d="wave(165, 8, 1)" fill="none" opacity="0.7" />
        <path :d="wave(190, 8, 2)" fill="none" opacity="0.45" />
      </template>

      <template v-else-if="game.motif === 'tracks'">
        <path d="M120 215 L185 70 M280 215 L215 70" />
        <path
          v-for="i in 7"
          :key="i"
          :d="`M${185 - i * 9.5} ${70 + i * 20} L${215 + i * 9.5} ${70 + i * 20}`"
          :stroke="colors.secondary"
          stroke-width="4"
        />
      </template>

      <template v-else-if="game.motif === 'sun'">
        <circle cx="200" cy="120" r="34" :fill="colors.secondary" stroke="none" />
        <path
          v-for="i in 12"
          :key="i"
          :d="`M${200 + Math.cos((i * Math.PI) / 6) * 46} ${120 + Math.sin((i * Math.PI) / 6) * 46} L${200 + Math.cos((i * Math.PI) / 6) * 66} ${120 + Math.sin((i * Math.PI) / 6) * 66}`"
          :stroke="colors.secondary"
        />
        <path d="M0 200 L100 160 L180 190 L260 150 L400 195 L400 225 L0 225 Z" :fill="colors.background" stroke="none" />
      </template>

      <template v-else-if="game.motif === 'islands'">
        <g v-for="(isle, i) in [[200, 80, 60], [100, 120, 34], [310, 135, 40]]" :key="i">
          <ellipse :cx="isle[0]" :cy="isle[1]" :rx="isle[2]" :ry="isle[2] / 5" :fill="colors.primary" stroke="none" />
          <path
            :d="`M${isle[0] - isle[2] * 0.7} ${isle[1] + 4} L${isle[0]} ${isle[1] + isle[2] * 0.6} L${isle[0] + isle[2] * 0.7} ${isle[1] + 4} Z`"
            :fill="colors.background"
            stroke="none"
          />
        </g>
        <path d="M0 215 L400 215" :stroke="colors.secondary" stroke-dasharray="4 10" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.emblem {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
</style>
