<script setup>
import { computed } from 'vue'

// Original illustrated scene for each game, keyed by slug and tinted with its era palette.
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

// The build-time prerender leaves the artwork out to keep the HTML small; it draws a gradient
// placeholder of the same size, and the live app draws the scene when it takes over.
const isPrerender = import.meta.env.SSR

const slug = props.game.slug
const id = (name) => `scene-${slug}-${name}`
const url = (name) => `url(#${id(name)})`

// Deterministic randomness so each scene draws the same way every time.
const seeded = (salt) => {
  let seed = ([...slug].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7) + salt) >>> 0
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
}
const scatter = (n, salt, fn) => {
  const rand = seeded(salt)
  return Array.from({ length: n }, (_, i) => fn(rand, i))
}

const stars = scatter(40, 1, (r) => ({
  x: r() * 400,
  y: r() * 120,
  r: r() * 1.2 + 0.3,
  o: r() * 0.6 + 0.25,
}))

const wave = (y, amp, phase, len = 32) => {
  let d = `M0 ${y}`
  for (let x = 0; x <= 400; x += 10) d += ` L${x} ${(y + Math.sin(x / len + phase) * amp).toFixed(1)}`
  return d
}

const hills = (base, amp, freq, phase = 0, floor = 225) => {
  let d = `M0 ${floor} L0 ${base}`
  for (let x = 0; x <= 400; x += 8) {
    const y = base - Math.sin(x / freq + phase) * amp - Math.sin(x / (freq * 0.43) + phase * 1.7) * amp * 0.35
    d += ` L${x} ${y.toFixed(1)}`
  }
  return `${d} L400 ${floor} Z`
}

// A floating island: rocky underside plus a separate grassy top.
const island = (cx, cy, w) => {
  const h = w * 0.45
  return `M${cx - w / 2} ${cy} Q${cx} ${cy - w * 0.08} ${cx + w / 2} ${cy} L${cx + w * 0.3} ${cy + h * 0.4} L${cx + w * 0.12} ${cy + h} L${cx - w * 0.05} ${cy + h * 0.55} L${cx - w * 0.28} ${cy + h * 0.35} Z`
}
const islandTop = (cx, cy, w) =>
  `M${cx - w / 2} ${cy} Q${cx} ${cy - w * 0.1} ${cx + w / 2} ${cy} Q${cx} ${cy + w * 0.07} ${cx - w / 2} ${cy} Z`

const ticks = (cx, cy, r1, r2, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return `M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)} L${(cx + Math.cos(a) * r2).toFixed(1)} ${(cy + Math.sin(a) * r2).toFixed(1)}`
  })

const blades = (n, salt, minH, maxH) =>
  scatter(n, salt, (r) => {
    const x = r() * 410 - 10
    const h = minH + r() * (maxH - minH)
    const lean = (r() - 0.5) * 40
    const w = 6 + r() * 8
    return `M${x.toFixed(1)} 225 Q${(x + lean * 0.3).toFixed(1)} ${(225 - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(225 - h).toFixed(1)} Q${(x + w * 0.6 + lean * 0.3).toFixed(1)} ${(225 - h * 0.5).toFixed(1)} ${(x + w).toFixed(1)} 225 Z`
  })

const bunting = (y0, sag, n, colors) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n
    return { x: 400 * t, y: y0 + 4 * sag * t * (1 - t), color: colors[i % colors.length] }
  })

const quad = (t, p0, c, p2) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * c + t ** 2 * p2
const railTies = Array.from({ length: 16 }, (_, i) => {
  const t = 0.04 + i * 0.06
  return {
    d: `M${quad(t, 40, 180, 300).toFixed(1)} ${quad(t, 225, 160, 150).toFixed(1)} L${quad(t, 100, 210, 306).toFixed(1)} ${quad(t, 225, 168, 152).toFixed(1)}`,
    w: 5 - t * 4,
  }
})

// 25 x 14 tile map for the retro overworld scene.
const OVERWORLD = [
  'MMMMMMMMMMMMMMMMMMMMMMMMM',
  'MMMMMMMCMMMMMMMMMMMMMMMMM',
  'MMMMMGGGGGMMMMMMMMMGGGMMM',
  'MMMGGGGGGGGGGMMMMGGGGGGMM',
  'MMGGGTGGTGGGGGGGGGGTGGGGM',
  'MGGGGGGGGGGGGGGGGGGGGGGGM',
  'GGGTGGGGGGWWWWWGGGGGTGGGG',
  'GGGGGGGGGWWWWWWWGGGGGGGGG',
  'GGTGGTGGGWWWWWWWGGGTGGTGG',
  'GGGGGGGGGGWWWWWGGGGGGGGGG',
  'TGGGTGGGGGGGGGGGGGGGGGGGT',
  'TTGGGGGGTGGGGGGTGGGGGGGTT',
  'TTTGGTGGGGGGGGGGGGTGGGTTT',
  'TTTTTTTTTGGGGGGGTTTTTTTTT',
]
const overworld = OVERWORLD.flatMap((row, r) =>
  [...row.padEnd(25, 'G').slice(0, 25)].map((k, col) => ({ x: col * 16, y: r * 16, k })),
)

const backBlades = blades(22, 2, 80, 170)
const frontBlades = blades(14, 3, 40, 90)
const embers = scatter(26, 4, (r) => ({ x: r() * 400, y: r() * 225, s: 2 + r() * 5, rot: r() * 90, o: 0.3 + r() * 0.6 }))
const confetti = scatter(30, 5, (r, i) => ({
  x: r() * 400,
  y: 60 + r() * 140,
  rot: r() * 180,
  color: ['#66d36e', '#ef5350', '#5c9cff', '#f0cc6b'][i % 4],
}))
const flags = bunting(30, 26, 18, ['#66d36e', '#ef5350', '#5c9cff'])
const flags2 = bunting(70, 18, 14, ['#f0cc6b', '#b48cf2', '#66d36e', '#ef5350'])
const seasonColors = ['#f2a7c3', '#5fbf5a', '#e08a3c', '#eaf3fb']
</script>

<template>
  <div
    v-if="isPrerender"
    class="emblem"
    role="img"
    :aria-label="`Illustration for ${game.title}`"
    :style="{ background: `linear-gradient(${colors.background}, ${colors.glow})` }"
  />
  <v-img v-else-if="customSrc" :src="customSrc" :alt="game.title" aspect-ratio="16/9" cover />
  <svg v-else class="emblem" viewBox="0 0 400 225" role="img" :aria-label="`Illustration for ${game.title}`">
    <defs>
      <linearGradient :id="id('sky')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="colors.background" />
        <stop offset="1" :stop-color="colors.glow" />
      </linearGradient>
      <linearGradient :id="id('fall')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8f6ff" stop-opacity="0.9" />
        <stop offset="1" stop-color="#e8f6ff" stop-opacity="0" />
      </linearGradient>
      <filter :id="id('glow')" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <clipPath :id="id('frame')"><rect width="400" height="225" /></clipPath>
    </defs>

    <g :clip-path="url('frame')">
      <rect width="400" height="225" :fill="url('sky')" />

      <!-- Skyward Sword: a sky island above a sea of clouds -->
      <template v-if="slug === 'skyward-sword'">
        <defs>
          <linearGradient :id="id('dusk')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1b2f57" />
            <stop offset="0.65" stop-color="#5d7fb8" />
            <stop offset="1" stop-color="#f3c47c" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('dusk')" />
        <circle v-for="(s, i) in stars.slice(0, 18)" :key="i" :cx="s.x" :cy="s.y * 0.5" :r="s.r" fill="#fff" :opacity="s.o * 0.7" />
        <path :d="island(70, 82, 60)" fill="#4a4e6e" opacity="0.75" />
        <path :d="islandTop(70, 82, 60)" fill="#5f8f6a" opacity="0.75" />
        <path :d="island(338, 62, 46)" fill="#4a4e6e" opacity="0.65" />
        <path :d="islandTop(338, 62, 46)" fill="#5f8f6a" opacity="0.65" />
        <rect x="228" y="124" width="7" height="80" :fill="url('fall')" />
        <path :d="island(200, 118, 170)" fill="#6b5646" />
        <path d="M150 128 L170 150 M245 126 L232 160" stroke="#54443a" stroke-width="2" fill="none" />
        <path :d="islandTop(200, 118, 170)" fill="#74b85f" />
        <rect x="181" y="74" width="22" height="40" fill="#e9dcc3" />
        <rect x="188" y="84" width="8" height="10" rx="4" fill="#3b4a6b" />
        <path d="M176 76 L192 56 L208 76 Z" fill="#c0563f" />
        <rect x="222" y="99" width="28" height="15" fill="#e9dcc3" />
        <path d="M219 101 L236 89 L253 101 Z" fill="#c0563f" />
        <rect x="139" y="100" width="4" height="14" fill="#6b4a2f" />
        <circle cx="141" cy="96" r="11" fill="#4f9a52" />
        <path
          v-for="(b, i) in [[110, 46], [128, 38], [290, 98], [305, 106]]"
          :key="`bird-${i}`"
          :d="`M${b[0]} ${b[1]} q5 -5 10 0 q5 -5 10 0`"
          stroke="#1b2f57"
          stroke-width="2"
          fill="none"
        />
        <g fill="#fff">
          <ellipse cx="40" cy="205" rx="80" ry="22" opacity="0.92" />
          <ellipse cx="150" cy="212" rx="90" ry="20" opacity="0.95" />
          <ellipse cx="270" cy="206" rx="85" ry="24" opacity="0.92" />
          <ellipse cx="380" cy="210" rx="70" ry="22" opacity="0.95" />
          <ellipse cx="95" cy="196" rx="40" ry="14" opacity="0.8" />
          <ellipse cx="330" cy="194" rx="45" ry="14" opacity="0.8" />
        </g>
      </template>

      <!-- The Minish Cap: the world at a tiny scale -->
      <template v-else-if="slug === 'minish-cap'">
        <defs>
          <linearGradient :id="id('meadow')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#102418" />
            <stop offset="0.7" stop-color="#2f6b39" />
            <stop offset="1" stop-color="#8cc36a" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('meadow')" />
        <polygon points="300,0 340,0 220,225 160,225" fill="#fff" opacity="0.05" />
        <polygon points="360,0 390,0 300,225 260,225" fill="#fff" opacity="0.04" />
        <path v-for="(d, i) in backBlades" :key="`bb-${i}`" :d="d" fill="#2c5e2f" />
        <rect x="88" y="150" width="72" height="80" rx="6" fill="#6b4a2f" />
        <ellipse cx="124" cy="150" rx="36" ry="9" fill="#8a6440" />
        <ellipse cx="124" cy="150" rx="22" ry="5" fill="none" stroke="#6b4a2f" stroke-width="1.5" />
        <ellipse cx="124" cy="150" rx="10" ry="2.5" fill="none" stroke="#6b4a2f" stroke-width="1.5" />
        <path d="M113 225 L113 192 Q124 177 135 192 L135 225 Z" fill="#3a2616" />
        <circle cx="131" cy="208" r="1.8" :fill="colors.secondary" />
        <rect x="118" y="172" width="12" height="9" rx="2" fill="#f0cc6b" opacity="0.85" />
        <path d="M250 225 Q246 170 256 132 L282 132 Q292 170 288 225 Z" fill="#efe3c8" />
        <path d="M216 138 Q269 66 322 138 Z" fill="#c9483b" />
        <circle v-for="(d, i) in [[248, 112, 7], [272, 96, 9], [298, 118, 6], [262, 124, 4]]" :key="`dot-${i}`" :cx="d[0]" :cy="d[1]" :r="d[2]" fill="#f7efe0" />
        <path v-for="(d, i) in frontBlades" :key="`fb-${i}`" :d="d" fill="#4f9a45" />
        <g v-for="(d, i) in [[60, 120, 6], [340, 168, 5], [196, 186, 4]]" :key="`dew-${i}`">
          <circle :cx="d[0]" :cy="d[1]" :r="d[2]" fill="#bfe6ff" opacity="0.85" />
          <circle :cx="d[0] - d[2] * 0.35" :cy="d[1] - d[2] * 0.35" :r="d[2] * 0.3" fill="#fff" />
        </g>
        <circle v-for="(s, i) in stars.slice(0, 12)" :key="`ff-${i}`" :cx="s.x" :cy="40 + s.y" r="1.6" fill="#f6e27a" :opacity="s.o" />
      </template>

      <!-- Four Swords: four lights rising from a shrine -->
      <template v-else-if="slug === 'four-swords'">
        <circle v-for="(s, i) in stars" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" :opacity="s.o" />
        <polygon
          v-for="(col, i) in ['#66d36e', '#ef5350', '#5c9cff', '#b48cf2']"
          :key="col"
          :points="`${194 + i * 4},130 ${20 + i * 100},0 ${80 + i * 100},0`"
          :fill="col"
          opacity="0.35"
        />
        <path :d="hills(182, 8, 60, 0)" fill="#0e1b14" />
        <rect x="120" y="120" width="12" height="62" fill="#4b545e" />
        <rect x="268" y="120" width="12" height="62" fill="#4b545e" />
        <rect x="116" y="114" width="20" height="7" fill="#5d6670" />
        <rect x="264" y="114" width="20" height="7" fill="#5d6670" />
        <rect x="158" y="172" width="84" height="12" fill="#5d6670" />
        <rect x="170" y="161" width="60" height="11" fill="#6f7882" />
        <rect x="188" y="134" width="24" height="27" fill="#7d8893" />
        <rect x="182" y="128" width="36" height="7" fill="#909ba6" />
        <ellipse cx="200" cy="128" rx="18" ry="5" fill="#fff" opacity="0.5" :filter="url('glow')" />
        <circle v-for="(s, i) in stars.slice(0, 14)" :key="`sp-${i}`" :cx="150 + s.x / 4" :cy="60 + s.y / 2" r="1.5" :fill="colors.secondary" :opacity="s.o" />
      </template>

      <!-- Ocarina of Time: a temple beneath a sky split between night and day -->
      <template v-else-if="slug === 'ocarina-of-time'">
        <defs>
          <linearGradient :id="id('day')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7fb3e6" />
            <stop offset="1" stop-color="#f6d38a" />
          </linearGradient>
          <clipPath :id="id('right')"><rect x="200" width="200" height="225" /></clipPath>
        </defs>
        <circle v-for="(s, i) in stars.filter((s) => s.x < 200)" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" :opacity="s.o" />
        <circle cx="70" cy="48" r="16" fill="#f3e7c0" />
        <circle cx="78" cy="43" r="14" :fill="colors.background" />
        <g :clip-path="url('right')">
          <rect width="400" height="225" :fill="url('day')" />
          <circle cx="335" cy="55" r="18" fill="#fff3c4" />
          <circle cx="335" cy="55" r="28" fill="#fff3c4" opacity="0.3" />
        </g>
        <circle cx="200" cy="96" r="72" fill="none" :stroke="colors.secondary" stroke-width="2" opacity="0.6" />
        <path v-for="(d, i) in ticks(200, 96, 64, 72, 12)" :key="`t-${i}`" :d="d" :stroke="colors.secondary" stroke-width="3" opacity="0.7" />
        <rect y="200" width="400" height="25" fill="#2f4a33" />
        <rect x="90" y="192" width="220" height="10" fill="#b8b09f" />
        <rect x="108" y="183" width="184" height="10" fill="#c9c1b0" />
        <rect x="126" y="174" width="148" height="10" fill="#d6cfbf" />
        <rect x="145" y="116" width="110" height="58" fill="#ddd3bf" />
        <rect v-for="i in 4" :key="`col-${i}`" :x="150 + (i - 1) * 30" y="118" width="10" height="56" fill="#c4b9a2" />
        <path d="M135 118 L200 84 L265 118 Z" fill="#e8dfcc" />
        <circle cx="200" cy="104" r="7" fill="none" stroke="#b8a77f" stroke-width="2" />
        <path d="M190 174 L190 146 Q200 134 210 146 L210 174 Z" fill="#3a3a48" />
      </template>

      <!-- A Link to the Past: a light world mirrored by a dark one -->
      <template v-else-if="slug === 'a-link-to-the-past'">
        <defs>
          <linearGradient :id="id('light')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6fb6e8" />
            <stop offset="1" stop-color="#cfeaf7" />
          </linearGradient>
          <linearGradient :id="id('dark')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2a0f2e" />
            <stop offset="1" stop-color="#6a2140" />
          </linearGradient>
        </defs>
        <g
          v-for="world in [
            { t: '', sky: url('light'), h1: '#5fae4f', h2: '#3f8a3a', castle: '#e9e4d6', roof: '#4a6fb0' },
            { t: 'translate(0 225) scale(1 -1)', sky: url('dark'), h1: '#4a2a4f', h2: '#2f1a36', castle: '#1a0f1f', roof: '#7a1f2f' },
          ]"
          :key="world.sky"
          :transform="world.t"
        >
          <rect width="400" height="113" :fill="world.sky" />
          <path :d="hills(88, 10, 50, 0.4, 113)" :fill="world.h1" />
          <rect x="174" y="62" width="52" height="28" :fill="world.castle" />
          <rect x="166" y="50" width="13" height="40" :fill="world.castle" />
          <rect x="221" y="50" width="13" height="40" :fill="world.castle" />
          <rect x="193" y="38" width="14" height="28" :fill="world.castle" />
          <path d="M164 51 L172.5 38 L181 51 Z M219 51 L227.5 38 L236 51 Z M191 39 L200 24 L209 39 Z" :fill="world.roof" />
          <path d="M194 90 L194 78 Q200 72 206 78 L206 90 Z" :fill="world.roof" />
          <path :d="hills(100, 6, 35, 2, 113)" :fill="world.h2" />
          <circle cx="70" cy="92" r="9" :fill="world.h2" />
          <circle cx="330" cy="94" r="11" :fill="world.h2" />
        </g>
        <rect y="111" width="400" height="3" :fill="colors.secondary" />
        <rect y="109" width="400" height="7" :fill="colors.secondary" opacity="0.5" :filter="url('glow')" />
      </template>

      <!-- Oracle of Seasons & Ages: a tree of four seasons inside a ring of time -->
      <template v-else-if="slug === 'oracle-games'">
        <rect v-for="(col, i) in seasonColors" :key="`band-${i}`" :x="i * 100" width="100" height="225" :fill="col" opacity="0.12" />
        <circle cx="200" cy="100" r="96" fill="none" :stroke="colors.secondary" stroke-width="2" stroke-dasharray="3 7" opacity="0.6" />
        <path v-for="(d, i) in ticks(200, 100, 90, 102, 12)" :key="`t-${i}`" :d="d" :stroke="colors.secondary" stroke-width="2.5" opacity="0.6" />
        <path :d="hills(198, 4, 50, 0)" fill="#2c3d2a" />
        <path
          d="M190 205 L194 142 Q182 124 168 116 L174 111 Q190 120 197 130 L198 104 L204 104 L205 130 Q214 118 230 110 L235 115 Q220 124 208 142 L212 205 Z"
          fill="#6b4a2f"
        />
        <g v-for="(q, i) in [[172, 72], [228, 72], [228, 112], [172, 112]]" :key="`leaf-${i}`" :fill="seasonColors[i]">
          <circle :cx="q[0]" :cy="q[1]" r="30" />
          <circle :cx="q[0] + (i === 1 || i === 2 ? 18 : -18)" :cy="q[1] + (i < 2 ? -6 : 6)" r="18" />
          <circle :cx="q[0]" :cy="q[1] + (i < 2 ? -20 : 20)" r="17" />
        </g>
        <ellipse v-for="(s, i) in stars.slice(0, 8)" :key="`petal-${i}`" :cx="s.x / 4 + 20" :cy="60 + s.y" rx="3" ry="1.8" fill="#f2a7c3" :transform="`rotate(${s.x} ${s.x / 4 + 20} ${60 + s.y})`" />
        <circle v-for="(s, i) in stars.slice(8, 22)" :key="`snow-${i}`" :cx="300 + s.x / 4" :cy="30 + s.y * 1.3" r="1.6" fill="#fff" />
        <rect v-for="(s, i) in stars.slice(22, 30)" :key="`al-${i}`" :x="210 + s.x / 5" :y="140 + s.y / 3" width="4" height="3" fill="#e08a3c" :transform="`rotate(${s.x} ${210 + s.x / 5} ${140 + s.y / 3})`" />
      </template>

      <!-- Link's Awakening: an island with a giant egg on the mountaintop -->
      <template v-else-if="slug === 'links-awakening'">
        <circle v-for="(s, i) in stars" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#fff" :opacity="s.o" />
        <circle cx="338" cy="44" r="16" fill="#f5ecd0" />
        <circle cx="338" cy="44" r="26" fill="#f5ecd0" opacity="0.15" />
        <rect y="160" width="400" height="65" fill="#123a5c" />
        <rect x="330" y="162" width="16" height="60" fill="#f5ecd0" opacity="0.15" />
        <path :d="wave(176, 3, 0)" stroke="#4fa3d6" stroke-width="1.5" fill="none" opacity="0.6" />
        <path :d="wave(196, 3, 1.4)" stroke="#4fa3d6" stroke-width="1.5" fill="none" opacity="0.4" />
        <path d="M50 166 Q110 140 150 134 L250 134 Q300 140 360 166 Z" fill="#2f4f3a" />
        <path d="M140 142 L184 80 L216 80 L262 142 Z" fill="#4a4f5c" />
        <path d="M184 80 L200 96 L216 80 Z" fill="#3c404b" />
        <ellipse cx="200" cy="64" rx="18" ry="22" fill="#f3ecd8" />
        <circle cx="194" cy="58" r="2.5" :fill="colors.secondary" />
        <circle cx="206" cy="68" r="2" :fill="colors.secondary" />
        <circle cx="198" cy="74" r="1.6" :fill="colors.secondary" />
        <ellipse cx="200" cy="64" rx="24" ry="28" fill="#f3ecd8" opacity="0.18" :filter="url('glow')" />
        <g v-for="(p, i) in [[96, 150, 1], [300, 150, -1]]" :key="`palm-${i}`">
          <path :d="`M${p[0]} ${p[1]} Q${p[0] + 6 * p[2]} ${p[1] - 20} ${p[0] + 2 * p[2]} ${p[1] - 40}`" stroke="#6b4a2f" stroke-width="4" fill="none" />
          <path
            :d="`M${p[0] + 2 * p[2]} ${p[1] - 40} q-18 -4 -26 8 M${p[0] + 2 * p[2]} ${p[1] - 40} q18 -4 26 8 M${p[0] + 2 * p[2]} ${p[1] - 40} q-8 -14 -22 -14 M${p[0] + 2 * p[2]} ${p[1] - 40} q8 -14 22 -14`"
            stroke="#3f8f4f"
            stroke-width="5"
            stroke-linecap="round"
            fill="none"
          />
        </g>
        <rect x="70" y="186" width="34" height="6" rx="2" fill="#7a5a3a" transform="rotate(-8 87 189)" />
      </template>

      <!-- A Link Between Worlds: a crack in a wall onto another land -->
      <template v-else-if="slug === 'a-link-between-worlds'">
        <defs>
          <pattern :id="id('bricks')" width="40" height="20" patternUnits="userSpaceOnUse">
            <rect width="40" height="20" fill="#565b66" />
            <path d="M0 0.5 H40 M0 10.5 H40 M20 0 V10 M0 10 V20 M40 10 V20" stroke="#3d414a" stroke-width="1.5" />
          </pattern>
          <linearGradient :id="id('lorule')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3a0d12" />
            <stop offset="1" stop-color="#b0452a" />
          </linearGradient>
          <clipPath :id="id('crack')">
            <polygon points="200,28 224,58 214,80 240,110 222,136 238,170 206,200 180,172 168,140 186,112 164,84 184,56" />
          </clipPath>
        </defs>
        <rect width="400" height="225" :fill="url('bricks')" />
        <g :clip-path="url('crack')">
          <rect width="400" height="225" :fill="url('lorule')" />
          <path d="M150 175 L180 160 L200 166 L230 156 L260 172 L260 225 L150 225 Z" fill="#2a0a0e" />
          <rect x="214" y="132" width="9" height="30" fill="#2a0a0e" />
          <rect x="226" y="140" width="7" height="22" fill="#2a0a0e" />
          <path d="M218 132 L218 124 M222 132 L222 120" stroke="#2a0a0e" stroke-width="3" />
          <path d="M184 168 L184 120 M184 140 L174 128 M184 130 L194 116" stroke="#1a0508" stroke-width="3" fill="none" />
        </g>
        <polygon
          points="200,28 224,58 214,80 240,110 222,136 238,170 206,200 180,172 168,140 186,112 164,84 184,56"
          fill="none"
          :stroke="colors.secondary"
          stroke-width="6"
          opacity="0.6"
          :filter="url('glow')"
        />
        <polygon
          points="200,28 224,58 214,80 240,110 222,136 238,170 206,200 180,172 168,140 186,112 164,84 184,56"
          fill="none"
          :stroke="colors.secondary"
          stroke-width="2"
        />
        <rect y="204" width="400" height="21" fill="#2f333a" />
        <ellipse cx="204" cy="210" rx="60" ry="6" :fill="colors.secondary" opacity="0.25" />
      </template>

      <!-- Tri Force Heroes: a festival town strung with bunting -->
      <template v-else-if="slug === 'tri-force-heroes'">
        <defs>
          <linearGradient :id="id('fest')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#24345c" />
            <stop offset="1" stop-color="#c97b8a" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('fest')" />
        <path
          d="M0 225 L0 150 L30 150 L30 128 L48 112 L66 128 L66 150 L92 150 L92 136 L120 136 L120 150 L290 150 L290 130 L312 110 L334 130 L334 150 L356 150 L356 138 L380 138 L380 150 L400 150 L400 225 Z"
          fill="#1c2238"
        />
        <path d="M0 30 Q200 82 400 30" stroke="#e9dcc3" stroke-width="1.5" fill="none" />
        <path v-for="(f, i) in flags" :key="`f-${i}`" :d="`M${f.x - 7} ${f.y} L${f.x + 7} ${f.y} L${f.x} ${f.y + 13} Z`" :fill="f.color" />
        <path d="M0 70 Q200 106 400 70" stroke="#e9dcc3" stroke-width="1.5" fill="none" />
        <path v-for="(f, i) in flags2" :key="`g-${i}`" :d="`M${f.x - 6} ${f.y} L${f.x + 6} ${f.y} L${f.x} ${f.y + 11} Z`" :fill="f.color" />
        <polygon points="182,0 218,0 250,200 150,200" fill="#fff4c9" opacity="0.1" />
        <rect x="140" y="196" width="120" height="12" fill="#6b4a2f" />
        <rect x="132" y="206" width="136" height="19" fill="#4a321f" />
        <g v-for="(col, i) in ['#66d36e', '#ef5350', '#5c9cff']" :key="col">
          <rect x="182" :y="160 - i * 32" width="36" height="34" rx="6" :fill="col" />
          <rect x="182" :y="160 - i * 32" width="36" height="5" rx="2" :fill="colors.secondary" />
          <circle cx="200" :cy="177 - i * 32" r="5" fill="#fff" opacity="0.7" />
        </g>
        <rect v-for="(p, i) in confetti" :key="`c-${i}`" :x="p.x" :y="p.y" width="5" height="3" :fill="p.color" :transform="`rotate(${p.rot} ${p.x} ${p.y})`" />
      </template>

      <!-- Echoes of Wisdom: rifts tearing across a meadow, with copied objects floating nearby -->
      <template v-else-if="slug === 'echoes-of-wisdom'">
        <defs>
          <linearGradient :id="id('meadow')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7fb2d4" />
            <stop offset="1" stop-color="#e8f2d8" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('meadow')" />
        <path :d="hills(165, 10, 70, 0.5)" fill="#5fae4f" />
        <path :d="hills(190, 8, 50, 2)" fill="#4a9a40" />
        <g v-for="(pts, i) in ['20,120 90,104 140,126 210,108 260,130 330,112 390,128 330,138 260,142 210,124 140,144 90,118', '250,170 290,160 320,176 360,166 340,186 300,180 268,190']" :key="`rift-${i}`">
          <polygon :points="pts" fill="none" stroke="#b07cff" stroke-width="6" opacity="0.6" :filter="url('glow')" />
          <polygon :points="pts" fill="#1a0f2a" stroke="#b07cff" stroke-width="1.5" />
        </g>
        <g stroke="#9ef0ff" stroke-width="2" :fill="colors.primary" fill-opacity="0.2">
          <rect x="62" y="44" width="34" height="34" rx="2" />
          <path d="M62 44 L96 78 M96 44 L62 78" fill="none" />
          <rect x="282" y="48" width="56" height="16" rx="3" />
          <rect x="286" y="40" width="16" height="9" rx="3" />
          <path d="M286 64 L286 72 M334 64 L334 72" />
          <rect x="164" y="40" width="44" height="7" rx="2" />
          <path d="M170 47 L170 68 M202 47 L202 68" />
          <rect x="120" y="160" width="26" height="26" rx="8" />
        </g>
        <circle v-for="(s, i) in stars.slice(0, 16)" :key="`sp-${i}`" :cx="s.x" :cy="20 + s.y * 0.5" r="1.4" fill="#fff" :opacity="s.o" />
      </template>

      <!-- The Legend of Zelda: a retro tiled overworld -->
      <template v-else-if="slug === 'the-legend-of-zelda'">
        <rect width="400" height="225" fill="#fcd8a8" />
        <g v-for="(cell, i) in overworld" :key="i">
          <template v-if="cell.k === 'M'">
            <rect :x="cell.x" :y="cell.y" width="16" height="16" fill="#c84c0c" />
            <rect :x="cell.x + 2" :y="cell.y + 3" width="5" height="4" fill="#a03c08" />
            <rect :x="cell.x + 9" :y="cell.y + 10" width="5" height="4" fill="#a03c08" />
          </template>
          <rect v-else-if="cell.k === 'C'" :x="cell.x" :y="cell.y" width="16" height="16" fill="#000" />
          <template v-else-if="cell.k === 'W'">
            <rect :x="cell.x" :y="cell.y" width="16" height="16" fill="#2038ec" />
            <rect :x="cell.x + 3" :y="cell.y + 6" width="6" height="2" fill="#6888fc" />
          </template>
          <template v-else-if="cell.k === 'T'">
            <rect :x="cell.x + 2" :y="cell.y + 1" width="12" height="11" rx="2" fill="#00a800" />
            <rect :x="cell.x + 4" :y="cell.y + 3" width="4" height="4" fill="#006800" />
            <rect :x="cell.x + 7" :y="cell.y + 11" width="2" height="4" fill="#7a4a10" />
          </template>
        </g>
      </template>

      <!-- Zelda II: a palace on the horizon in a side-scrolling world -->
      <template v-else-if="slug === 'zelda-ii'">
        <defs>
          <linearGradient :id="id('dusk')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1a1040" />
            <stop offset="1" stop-color="#6a4a9a" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('dusk')" />
        <g fill="#fff" opacity="0.8">
          <rect x="40" y="30" width="48" height="8" />
          <rect x="52" y="22" width="24" height="8" />
          <rect x="280" y="50" width="56" height="8" />
          <rect x="296" y="42" width="24" height="8" />
        </g>
        <path d="M0 160 L0 120 L30 120 L30 104 L60 104 L60 88 L90 88 L90 112 L130 112 L130 160 Z M270 160 L270 108 L300 108 L300 92 L330 92 L330 116 L370 116 L370 100 L400 100 L400 160 Z" fill="#3a2a6a" />
        <ellipse cx="200" cy="170" rx="150" ry="30" fill="#2a4a2a" />
        <rect x="130" y="148" width="140" height="10" fill="#c8b080" />
        <rect v-for="i in 6" :key="`col-${i}`" :x="138 + (i - 1) * 22" y="108" width="10" height="40" fill="#e0d0a8" />
        <rect x="130" y="98" width="140" height="10" fill="#c8b080" />
        <rect x="142" y="88" width="116" height="10" fill="#d8c898" />
        <rect x="162" y="78" width="76" height="10" fill="#e0d0a8" />
        <rect x="182" y="68" width="36" height="10" fill="#e8dab4" />
        <rect x="191" y="122" width="18" height="26" fill="#1a1040" />
        <g v-for="row in 3" :key="`br-${row}`">
          <rect
            v-for="b in 21"
            :key="b"
            :x="(b - 1) * 20 - (row % 2) * 10"
            :y="186 + (row - 1) * 13"
            width="19"
            height="12"
            :fill="(b + row) % 2 ? '#8a4a20' : '#a85a28'"
          />
        </g>
      </template>

      <!-- Majora's Mask: a looming moon over a clock-tower town -->
      <template v-else-if="slug === 'majoras-mask'">
        <defs>
          <linearGradient :id="id('doom')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1a0612" />
            <stop offset="0.6" stop-color="#a8341f" />
            <stop offset="1" stop-color="#f08a4b" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('doom')" />
        <circle cx="236" cy="66" r="96" fill="#f08a4b" opacity="0.18" :filter="url('glow')" />
        <circle cx="236" cy="66" r="84" fill="#b8a98a" />
        <circle cx="258" cy="86" r="84" fill="#8f8068" opacity="0.35" />
        <circle v-for="(c, i) in [[176, 30, 13], [262, 18, 9], [214, 98, 7], [290, 70, 15], [192, 70, 6], [248, 128, 10]]" :key="`cr-${i}`" :cx="c[0]" :cy="c[1]" :r="c[2]" fill="#8f8068" opacity="0.7" />
        <rect x="66" y="72" width="44" height="153" fill="#2a1418" />
        <path d="M60 74 L88 40 L116 74 Z" fill="#2a1418" />
        <circle cx="88" cy="100" r="14" fill="#e8d9b0" />
        <path d="M88 100 L88 90 M88 100 L95 104" stroke="#2a1418" stroke-width="2" />
        <path
          d="M0 225 L0 180 L20 180 L32 166 L44 180 L60 180 L60 225 Z M116 225 L116 176 L140 176 L154 160 L168 176 L190 176 L190 188 L230 188 L230 170 L250 156 L270 170 L270 186 L300 186 L314 172 L328 186 L360 186 L360 176 L380 166 L400 176 L400 225 Z"
          fill="#1a0a10"
        />
        <rect v-for="(e, i) in embers" :key="`e-${i}`" :x="e.x" :y="e.y" width="2" height="2" fill="#f6c06a" :opacity="e.o * 0.7" />
      </template>

      <!-- Twilight Princess: a castle swallowed by twilight -->
      <template v-else-if="slug === 'twilight-princess'">
        <defs>
          <linearGradient :id="id('twilight')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0d0710" />
            <stop offset="0.55" stop-color="#4a1a3a" />
            <stop offset="1" stop-color="#f08a4b" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('twilight')" />
        <circle cx="200" cy="205" r="64" fill="#f3a75a" opacity="0.45" />
        <path d="M60 0 L60 225 M120 0 L120 225 M280 0 L280 225 M340 0 L340 225" :stroke="colors.primary" stroke-width="1" opacity="0.15" />
        <path
          d="M110 225 L110 150 L130 150 L130 120 L140 110 L150 120 L150 150 L170 150 L170 104 L182 90 L194 104 L194 120 L206 120 L206 104 L218 90 L230 104 L230 150 L250 150 L250 120 L260 110 L270 120 L270 150 L290 150 L290 225 Z"
          fill="#120a14"
        />
        <path :d="hills(196, 6, 40, 1)" fill="#0d0710" />
        <rect
          v-for="(e, i) in embers"
          :key="`p-${i}`"
          :x="e.x"
          :y="e.y * 0.85"
          :width="e.s"
          :height="e.s"
          fill="#0d0710"
          stroke="#f08a4b"
          stroke-width="0.8"
          :opacity="e.o"
          :transform="`rotate(${e.rot} ${e.x} ${e.y * 0.85})`"
        />
      </template>

      <!-- Four Swords Adventures: a castle flying four colored banners -->
      <template v-else-if="slug === 'four-swords-adventures'">
        <defs>
          <linearGradient :id="id('dawn')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2a1f48" />
            <stop offset="1" stop-color="#e8a27a" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('dawn')" />
        <path :d="hills(150, 14, 60, 0.8)" fill="#3b2f5a" />
        <rect x="150" y="96" width="100" height="58" fill="#20183a" />
        <rect v-for="(x, i) in [140, 176, 212, 248]" :key="`tw-${i}`" :x="x" :y="80 - (i % 3 === 0 ? 0 : 14)" width="14" height="74" fill="#20183a" />
        <g v-for="(col, i) in ['#66d36e', '#ef5350', '#5c9cff', '#b48cf2']" :key="col">
          <path :d="`M${147 + i * 36} ${80 - (i % 3 === 0 ? 0 : 14)} L${147 + i * 36} ${58 - (i % 3 === 0 ? 0 : 14)}`" stroke="#e9dcc3" stroke-width="1.5" />
          <path :d="`M${148 + i * 36} ${58 - (i % 3 === 0 ? 0 : 14)} l18 5 l-18 6 Z`" :fill="col" />
        </g>
        <path d="M188 154 L188 136 Q200 126 212 136 L212 154 Z" :fill="colors.secondary" opacity="0.6" />
        <path :d="hills(180, 10, 45, 2.2)" fill="#2a2142" />
        <path d="M200 156 Q170 180 230 196 Q260 206 210 225" stroke="#c9b48a" stroke-width="7" fill="none" opacity="0.7" />
      </template>

      <!-- The Wind Waker: a small sailboat on the open sea -->
      <template v-else-if="slug === 'the-wind-waker'">
        <defs>
          <linearGradient :id="id('day')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2b7fc0" />
            <stop offset="1" stop-color="#a8def7" />
          </linearGradient>
          <linearGradient :id="id('sea')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#1a6fa8" />
            <stop offset="1" stop-color="#0c3f66" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('day')" />
        <circle cx="322" cy="58" r="40" fill="#ffe9a3" opacity="0.3" />
        <circle cx="322" cy="58" r="26" fill="#ffe9a3" />
        <g fill="#fff">
          <circle cx="70" cy="62" r="16" />
          <circle cx="90" cy="54" r="20" />
          <circle cx="112" cy="64" r="14" />
          <rect x="60" y="62" width="62" height="16" rx="8" />
        </g>
        <path d="M150 50 C180 30 210 70 240 46 a10 10 0 1 0 -12 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85" />
        <path d="M30 110 C70 92 100 126 140 104 a8 8 0 1 0 -10 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7" />
        <path d="M300 150 Q330 128 360 150 Z" fill="#3f8f4f" />
        <rect x="328" y="128" width="3" height="10" fill="#6b4a2f" />
        <circle cx="330" cy="126" r="6" fill="#3f8f4f" />
        <rect y="150" width="400" height="75" :fill="url('sea')" />
        <path :d="wave(164, 2.5, 0)" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.35" />
        <path :d="wave(188, 3, 2)" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.25" />
        <path d="M110 176 L170 172 M120 184 L172 178" stroke="#fff" stroke-width="2" opacity="0.6" />
        <path d="M168 166 L238 166 L228 182 L178 182 Z" fill="#8a5a2f" />
        <path d="M204 166 L204 100" stroke="#5a3a1f" stroke-width="3" />
        <path d="M207 102 Q244 128 207 160 Z" fill="#f3ead2" />
        <path d="M201 108 Q178 130 201 156 Z" fill="#e2d6b8" />
      </template>

      <!-- Phantom Hourglass: a ghost ship in the fog -->
      <template v-else-if="slug === 'phantom-hourglass'">
        <defs>
          <linearGradient :id="id('night')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#06101a" />
            <stop offset="1" stop-color="#1a3a4a" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('night')" />
        <circle v-for="(s, i) in stars" :key="i" :cx="s.x" :cy="s.y * 0.8" :r="s.r" fill="#fff" :opacity="s.o * 0.7" />
        <circle cx="76" cy="50" r="18" fill="#e8f0e0" opacity="0.9" />
        <g :stroke="colors.secondary" stroke-width="2" fill="none">
          <path d="M320 28 L352 28 L336 46 Z M320 64 L352 64 L336 46 Z" />
        </g>
        <path d="M328 60 L344 60 L336 52 Z" :fill="colors.secondary" />
        <g opacity="0.9">
          <path d="M126 160 L294 160 L278 184 L146 184 Z" fill="#0a1a20" stroke="#6fe0c0" stroke-width="1.5" />
          <path d="M170 160 L170 70 M230 160 L230 58 M270 160 L270 96" stroke="#6fe0c0" stroke-width="2" />
          <path d="M150 80 L190 80 L188 140 L180 132 L172 144 L160 134 L152 142 Z" fill="#1a3a3a" stroke="#6fe0c0" stroke-width="1" opacity="0.75" />
          <path d="M208 68 L252 68 L250 140 L240 130 L232 146 L222 132 L210 142 Z" fill="#1a3a3a" stroke="#6fe0c0" stroke-width="1" opacity="0.75" />
          <path d="M256 104 L284 104 L282 150 L274 142 L264 152 L258 144 Z" fill="#1a3a3a" stroke="#6fe0c0" stroke-width="1" opacity="0.75" />
        </g>
        <path d="M126 160 L294 160 L278 184 L146 184 Z" fill="none" stroke="#6fe0c0" stroke-width="5" opacity="0.35" :filter="url('glow')" />
        <rect y="180" width="400" height="45" fill="#0a1a24" />
        <path :d="wave(192, 2, 0.5)" stroke="#6fe0c0" stroke-width="1" fill="none" opacity="0.3" />
        <g fill="#fff">
          <ellipse cx="80" cy="170" rx="140" ry="12" opacity="0.08" />
          <ellipse cx="320" cy="178" rx="150" ry="14" opacity="0.1" />
          <ellipse cx="200" cy="196" rx="220" ry="12" opacity="0.07" />
        </g>
      </template>

      <!-- Spirit Tracks: a steam train heading toward a distant tower -->
      <template v-else-if="slug === 'spirit-tracks'">
        <defs>
          <linearGradient :id="id('day')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3a7fb8" />
            <stop offset="1" stop-color="#f6e2a8" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('day')" />
        <rect x="292" y="34" width="20" height="120" fill="#d8d0bf" />
        <rect v-for="i in 5" :key="`band-${i}`" x="288" :y="40 + (i - 1) * 24" width="28" height="5" fill="#b8ae98" />
        <path d="M290 34 L302 16 L314 34 Z" fill="#b8ae98" />
        <circle cx="302" cy="14" r="8" :fill="colors.secondary" opacity="0.6" :filter="url('glow')" />
        <path :d="hills(152, 10, 60, 0.3)" fill="#4f8f5a" />
        <path :d="hills(178, 8, 40, 1.8)" fill="#3f7a4a" />
        <path v-for="(tie, i) in railTies" :key="`tie-${i}`" :d="tie.d" stroke="#6b4a2f" :stroke-width="tie.w" />
        <path d="M40 225 Q180 160 300 150 M100 225 Q210 168 306 152" stroke="#9aa3ad" stroke-width="2.5" fill="none" />
        <circle v-for="(p, i) in [[122, 140, 8], [110, 126, 10], [94, 108, 13], [74, 88, 15]]" :key="`smoke-${i}`" :cx="p[0]" :cy="p[1]" :r="p[2]" fill="#fff" :opacity="0.8 - i * 0.16" />
        <path d="M104 188 L110 172 L110 188 Z" fill="#8a2a2a" />
        <rect x="110" y="168" width="52" height="20" rx="8" fill="#2a3a4a" />
        <rect x="116" y="150" width="9" height="20" fill="#2a3a4a" />
        <rect x="114" y="148" width="13" height="4" :fill="colors.secondary" />
        <rect x="158" y="152" width="26" height="36" rx="2" fill="#8a2a2a" />
        <rect x="163" y="158" width="16" height="11" rx="2" fill="#f6e2a8" />
        <rect x="155" y="148" width="32" height="5" fill="#2a3a4a" />
        <g v-for="x in [124, 144, 172]" :key="`w-${x}`">
          <circle :cx="x" cy="190" r="7" fill="#151515" :stroke="colors.secondary" stroke-width="1.5" />
          <circle :cx="x" cy="190" r="2" :fill="colors.secondary" />
        </g>
      </template>

      <!-- Breath of the Wild: a wide vista over a ruined, haunted castle -->
      <template v-else-if="slug === 'breath-of-the-wild'">
        <defs>
          <linearGradient :id="id('dawn')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#23405e" />
            <stop offset="0.6" stop-color="#6f8fb0" />
            <stop offset="1" stop-color="#f2c58c" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" :fill="url('dawn')" />
        <circle cx="306" cy="146" r="34" fill="#fff2c9" opacity="0.3" />
        <circle cx="306" cy="146" r="20" fill="#fff2c9" />
        <path :d="hills(122, 24, 60, 1)" fill="#4f6f8a" opacity="0.85" />
        <g fill="#2a2a3a">
          <rect x="186" y="104" width="30" height="22" />
          <rect x="180" y="94" width="8" height="32" />
          <rect x="214" y="94" width="8" height="32" />
          <rect x="197" y="82" width="8" height="24" />
          <path d="M197 83 L201 72 L205 83 Z" />
        </g>
        <g fill="none" stroke="#c0405a" stroke-width="2.5" opacity="0.75">
          <ellipse cx="201" cy="100" rx="40" ry="10" transform="rotate(-12 201 100)" />
          <ellipse cx="201" cy="96" rx="30" ry="7" transform="rotate(16 201 96)" />
        </g>
        <ellipse cx="201" cy="98" rx="42" ry="14" fill="#c0405a" opacity="0.2" :filter="url('glow')" />
        <path :d="hills(146, 16, 45, 3)" fill="#3f5f6a" />
        <path :d="hills(168, 10, 38, 0.6)" fill="#2f5a40" />
        <path d="M0 225 L0 176 Q60 168 120 180 L160 225 Z" fill="#1f3a2a" />
        <path d="M14 176 l3 -8 l3 8 M40 172 l3 -9 l3 9 M90 174 l3 -7 l3 7" stroke="#4f8f5a" stroke-width="2" fill="none" />
        <rect x="64" y="148" width="5" height="26" fill="#3a2a1f" />
        <circle cx="66" cy="142" r="15" fill="#2f5a3a" />
        <circle cx="56" cy="150" r="9" fill="#2f5a3a" />
        <path d="M120 48 q5 -5 10 0 q5 -5 10 0 M146 60 q4 -4 8 0 q4 -4 8 0" stroke="#23405e" stroke-width="2" fill="none" />
      </template>

      <!-- Tears of the Kingdom: sky islands above a glowing chasm -->
      <template v-else-if="slug === 'tears-of-the-kingdom'">
        <defs>
          <linearGradient :id="id('sky2')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0e2a3a" />
            <stop offset="0.6" stop-color="#6fb8c8" />
            <stop offset="1" stop-color="#f2e2b0" />
          </linearGradient>
          <radialGradient :id="id('depths')" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#e0402a" stop-opacity="0.7" />
            <stop offset="1" stop-color="#e0402a" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="225" :fill="url('sky2')" />
        <polygon points="120,0 160,0 230,225 170,225" fill="#fff" opacity="0.06" />
        <polygon points="250,0 270,0 320,225 290,225" fill="#fff" opacity="0.05" />
        <rect x="236" y="96" width="6" height="96" :fill="url('fall')" />
        <g v-for="(isle, i) in [[200, 70, 150], [72, 104, 64], [338, 50, 72]]" :key="`isle-${i}`">
          <path :d="island(isle[0], isle[1], isle[2])" fill="#4a5a5a" />
          <path
            :d="`M${isle[0] - isle[2] * 0.3} ${isle[1] + 4} L${isle[0] - isle[2] * 0.1} ${isle[1] + isle[2] * 0.14} L${isle[0] + isle[2] * 0.05} ${isle[1] + isle[2] * 0.08} L${isle[0] + isle[2] * 0.1} ${isle[1] + isle[2] * 0.3}`"
            fill="none"
            :stroke="colors.primary"
            stroke-width="1.5"
          />
          <path :d="islandTop(isle[0], isle[1], isle[2])" fill="#6fbf8a" />
        </g>
        <rect x="186" y="44" width="16" height="22" fill="#9aa8a0" />
        <path d="M182 46 L194 34 L206 46 Z" :fill="colors.primary" />
        <path :d="hills(186, 6, 60, 0)" fill="#2f5a40" />
        <ellipse cx="200" cy="200" rx="90" ry="26" :fill="url('depths')" />
        <ellipse cx="200" cy="200" rx="48" ry="10" fill="#120508" />
        <circle v-for="(e, i) in embers.slice(0, 14)" :key="`m-${i}`" :cx="150 + e.x / 4" :cy="150 + e.y / 4.5" r="1.6" fill="#e0402a" :opacity="e.o" />
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
