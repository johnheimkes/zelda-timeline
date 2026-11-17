import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  // Vuetify's components import their own CSS, which Node can't load, so the prerender's
  // server build bundles Vuetify instead of importing it at runtime.
  ssr: { noExternal: ['vuetify'] },
})
