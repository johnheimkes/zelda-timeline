import { createSiteApp } from './app'
// Inter is self-hosted (SIL Open Font License) so the page makes no requests to Google.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './styles.css'

// #app already holds the prerendered page; mounting replaces it with the live app.
createSiteApp().app.mount('#app')
