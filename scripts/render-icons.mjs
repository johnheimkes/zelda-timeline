// Renders the favicon PNGs and the 1200x630 link-preview image into public/.
// Uses macOS Quick Look (qlmanage) to rasterize SVG and sips to resize, so it needs macOS.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const pub = join(root, 'public')
const tmp = mkdtempSync(join(tmpdir(), 'zelda-icons-'))

// The branching mark from public/favicon.svg, without its background tile.
const mark = `
  <g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 36 C32 26 16 26 16 14" stroke="#7bd36a" />
    <path d="M32 36 V12" stroke="#b48cf2" />
    <path d="M32 36 C32 26 48 26 48 14" stroke="#4fc3f7" />
    <path d="M32 58 V36" stroke="#f0cc6b" />
  </g>
  <circle cx="16" cy="12" r="4.5" fill="#7bd36a" />
  <circle cx="32" cy="10" r="4.5" fill="#b48cf2" />
  <circle cx="48" cy="12" r="4.5" fill="#4fc3f7" />
  <circle cx="32" cy="36" r="5" fill="#f0cc6b" />`

// iOS draws its own rounded corners, so the touch icon is full-bleed with padding.
const appleIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0b1322" />
  <g transform="translate(9.6 9.6) scale(0.7)">${mark}</g>
</svg>`

// Deterministic star field so the preview renders the same every time.
let seed = 7
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
const stars = Array.from(
  { length: 70 },
  () =>
    `<circle cx="${(rand() * 1200).toFixed(1)}" cy="${(rand() * 630).toFixed(1)}" r="${(rand() * 1.4 + 0.4).toFixed(2)}" fill="#fff" opacity="${(rand() * 0.5 + 0.15).toFixed(2)}" />`,
).join('')

const font = readFileSync(join(pub, 'fonts/HyliaSerifBeta-Regular.otf')).toString('base64')
const sans = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

// Quick Look renders into a square, and a square viewBox with no width/height fills it exactly.
// The viewBox starts at y=-285 so the 1200x630 image sits in the middle of the 1200x1200
// square, where sips's centered crop (it ignores --cropOffset) takes it back out.
const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -285 1200 1200">
  <defs>
    <style>
      @font-face { font-family: 'Hylia Serif'; src: url(data:font/otf;base64,${font}) format('opentype'); }
      .title { font-family: 'Hylia Serif', Georgia, serif; font-size: 66px; fill: #8fd3ff; }
    </style>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1322" />
      <stop offset="0.55" stop-color="#101b30" />
      <stop offset="1" stop-color="#08130f" />
    </linearGradient>
    <radialGradient id="blue"><stop offset="0" stop-color="#3d7ab8" stop-opacity="0.55" /><stop offset="1" stop-color="#3d7ab8" stop-opacity="0" /></radialGradient>
    <radialGradient id="green"><stop offset="0" stop-color="#1f8a6c" stop-opacity="0.45" /><stop offset="1" stop-color="#1f8a6c" stop-opacity="0" /></radialGradient>
    <radialGradient id="purple"><stop offset="0" stop-color="#6b3fa8" stop-opacity="0.35" /><stop offset="1" stop-color="#6b3fa8" stop-opacity="0" /></radialGradient>
    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="markGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <ellipse cx="140" cy="40" rx="620" ry="420" fill="url(#blue)" />
  <ellipse cx="1110" cy="610" rx="520" ry="380" fill="url(#green)" />
  <ellipse cx="880" cy="190" rx="420" ry="320" fill="url(#purple)" />
  ${stars}

  <text x="80" y="196" font-family="${sans}" font-size="22" font-weight="600" letter-spacing="6" fill="#f0cc6b">THE OFFICIAL CHRONOLOGY</text>
  <g opacity="0.45" filter="url(#glow)">
    <text class="title" x="80" y="290">The Legend of Zelda</text>
    <text class="title" x="80" y="366">Timeline</text>
  </g>
  <text class="title" x="80" y="290">The Legend of Zelda</text>
  <text class="title" x="80" y="366">Timeline</text>
  <text font-family="${sans}" font-size="26" fill="#c7d2e3">
    <tspan x="80" y="440">Every mainline game, from Skyward Sword to</tspan>
    <tspan x="80" y="478">Tears of the Kingdom, across all three branches.</tspan>
  </text>
  <text x="80" y="574" font-family="${sans}" font-size="22" letter-spacing="1.3" fill="#9aa8bd">zelda.heimk.es</text>

  <g transform="translate(905 190) scale(3.6)">
    <g opacity="0.5" filter="url(#markGlow)">${mark}</g>
    ${mark}
  </g>
</svg>`

// Rasterize an SVG with Quick Look; returns the PNG path (max dimension = size).
const render = (name, svg, size) => {
  const src = join(tmp, `${name}.svg`)
  writeFileSync(src, svg)
  execFileSync('qlmanage', ['-t', '-s', String(size), '-o', tmp, src], { stdio: 'ignore' })
  return `${src}.png`
}
const resize = (png, size, out) =>
  execFileSync('sips', ['-z', String(size), String(size), png, '--out', join(pub, out)], { stdio: 'ignore' })

try {
  // Crop the centered 1200x630 out of Quick Look's square and save it as a JPEG.
  execFileSync(
    'sips',
    ['-c', '630', '1200', '-s', 'format', 'jpeg', '-s', 'formatOptions', '88',
      render('og-image', ogImage, 1200), '--out', join(pub, 'og-image.jpg')],
    { stdio: 'ignore' },
  )
  resize(render('favicon', readFileSync(join(pub, 'favicon.svg'), 'utf8'), 512), 32, 'favicon-32.png')
  resize(render('apple-touch-icon', appleIcon, 512), 180, 'apple-touch-icon.png')
  console.log('Rendered public/og-image.jpg, public/favicon-32.png and public/apple-touch-icon.png')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
