import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { eras } from '../data/timeline'

// One dark theme per era; the page switches between them as you scroll.
const themes = Object.fromEntries(
  eras.map((era) => [
    era.id,
    {
      dark: true,
      colors: {
        background: era.colors.background,
        surface: era.colors.surface,
        primary: era.colors.primary,
        secondary: era.colors.secondary,
      },
    },
  ]),
)

export default createVuetify({
  theme: {
    defaultTheme: eras[0].id,
    themes,
  },
})
