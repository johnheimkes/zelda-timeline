// Writes the build-time render of the page into dist/index.html, so the title and content
// show as soon as the HTML and CSS arrive, before the JavaScript loads.
// Runs after the client and server builds as part of `npm run build`.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const serverDir = join(root, 'dist-ssr')
const indexPath = join(root, 'dist/index.html')

const { render } = await import(join(serverDir, 'entry-server.js'))
const { html, themeCss } = await render()

const page = readFileSync(indexPath, 'utf8')
const emptyApp = '<div id="app"></div>'
if (!page.includes(emptyApp)) throw new Error('dist/index.html has no empty #app to fill')

// Function replacements so `$` sequences in the markup aren't treated as patterns. The theme
// stylesheet uses Vuetify's own id, so the live app updates it instead of adding another.
// Inter is deliberately not preloaded: on slow connections it competes with the stylesheet,
// which delays first paint more than the font swap costs (see 'Inter Fallback' in styles.css).
const prerendered = page
  .replace(emptyApp, () => `<div id="app">${html}</div>`)
  .replace('</head>', () => `  <style id="vuetify-theme-stylesheet">${themeCss}</style>\n  </head>`)

writeFileSync(indexPath, prerendered)
rmSync(serverDir, { recursive: true, force: true })
console.log(`Prerendered dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB of markup)`)
