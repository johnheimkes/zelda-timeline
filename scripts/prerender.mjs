// Writes the build-time render of the page into dist/index.html, so the title and content
// show as soon as the HTML and CSS arrive, before the JavaScript loads.
// Runs after the client and server builds as part of `npm run build`.
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const serverDir = join(root, 'dist-ssr')
const indexPath = join(root, 'dist/index.html')

const { render } = await import(join(serverDir, 'entry-server.js'))
const { html, themeCss } = await render()

const page = readFileSync(indexPath, 'utf8')
const emptyApp = '<div id="app"></div>'
if (!page.includes(emptyApp)) throw new Error('dist/index.html has no empty #app to fill')

// Preload Inter's regular weight, which the intro paragraph uses, so it renders in Inter from
// the start instead of shifting when the font arrives. Its filename changes with each build.
const interFile = readdirSync(join(root, 'dist/assets')).find((f) => /^inter-latin-400-normal-.*\.woff2$/.test(f))
if (!interFile) throw new Error('Could not find the Inter 400 latin font in dist/assets to preload')
const interPreload = `<link rel="preload" href="/assets/${interFile}" as="font" type="font/woff2" crossorigin />`

// Function replacements so `$` sequences in the markup aren't treated as patterns. The theme
// stylesheet uses Vuetify's own id, so the live app updates it instead of adding another.
const prerendered = page
  .replace(emptyApp, () => `<div id="app">${html}</div>`)
  .replace('</head>', () => `  ${interPreload}\n  <style id="vuetify-theme-stylesheet">${themeCss}</style>\n  </head>`)

writeFileSync(indexPath, prerendered)
rmSync(serverDir, { recursive: true, force: true })
console.log(`Prerendered dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB of markup)`)
