import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'

// Build-time render used by scripts/prerender.mjs. It renders the desktop layout; in the
// browser the live app replaces it on load and switches to the phone layout where needed.
export async function render() {
  const { app, vuetify } = createSiteApp({ ssr: { clientWidth: 1280, clientHeight: 800 } })
  const html = await renderToString(app)
  return { html, themeCss: vuetify.theme.styles.value }
}
