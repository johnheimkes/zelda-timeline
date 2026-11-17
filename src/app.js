import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import createVuetifyInstance from './plugins/vuetify'

// Builds the site app. In the browser it's a normal app that replaces the prerendered
// markup on mount; with `ssr` options it's a server app for the build-time prerender.
export function createSiteApp({ ssr } = {}) {
  const app = ssr ? createSSRApp(App) : createApp(App)
  const vuetify = createVuetifyInstance(ssr ? { ssr } : {})
  app.use(vuetify)
  return { app, vuetify }
}
