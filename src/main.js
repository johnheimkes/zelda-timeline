import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
// Inter is self-hosted (SIL Open Font License) so the page makes no requests to Google.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './styles.css'

createApp(App).use(vuetify).mount('#app')
