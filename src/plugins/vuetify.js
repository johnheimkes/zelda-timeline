import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
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
  // SVG icons from @mdi/js, imported per icon, instead of the full icon font.
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: eras[0].id,
    themes,
  },
})
