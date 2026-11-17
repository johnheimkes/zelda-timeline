import { createSSRApp } from 'vue'
import App from './App.vue'
import createVuetifyInstance from './plugins/vuetify'

// The screen size the build-time prerender assumes (the desktop layout). The browser app starts
// from the same size so its first render matches the prerendered HTML exactly and can hydrate
// it; Vuetify then switches to the real screen size right after mounting.
export const PRERENDER_DISPLAY = { clientWidth: 1280, clientHeight: 800 }

// Builds the site app for both the build-time prerender and the browser, which hydrates the
// prerendered markup instead of replacing it.
export function createSiteApp() {
  const app = createSSRApp(App)
  const vuetify = createVuetifyInstance({ ssr: PRERENDER_DISPLAY })
  app.use(vuetify)
  return { app, vuetify }
}
