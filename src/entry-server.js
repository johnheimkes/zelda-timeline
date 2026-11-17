import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'

// Build-time render used by scripts/prerender.mjs, in the desktop layout (PRERENDER_DISPLAY).
// The browser app hydrates this markup and then adapts it to the real screen size.
export async function render() {
  const { app, vuetify } = createSiteApp()
  const html = await renderToString(app)
  return { html, themeCss: vuetify.theme.styles.value }
}
