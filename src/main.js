import { createSiteApp } from './app'
// Inter is self-hosted (SIL Open Font License) so the page makes no requests to Google.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './styles.css'

// #app already holds the prerendered page. Mounting hydrates it, attaching the app to the
// existing elements rather than rebuilding them, so nothing is redrawn as the app takes over.
createSiteApp().app.mount('#app')
