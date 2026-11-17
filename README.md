# Zelda Timeline

A single-page, fan-made guide to the official chronology of *The Legend of Zelda* series. Scroll from *Skyward Sword* to *Tears of the Kingdom* and follow the story as it splits into three branches after *Ocarina of Time*.

Built with [Vue 3](https://vuejs.org/), [Vuetify 3](https://vuetifyjs.com/) and [Vite](https://vite.dev/).

## Features

- **Vertical timeline** of every mainline game, each with a year, platform and short summary.
- **Era-based color themes.** The page fades between five dark palettes as you scroll:

  | Era | Palette |
  | --- | --- |
  | The Era of Myth | Sky blue and gold |
  | The Hero Is Defeated | Forest green and gold |
  | The Child Timeline | Twilight purple and orange |
  | The Adult Timeline | Ocean blue and sand |
  | The Era of Wilds | Teal-green and gold |

- **Timeline split section** after *Ocarina of Time*, linking to each branch.
- **Era navigation** dots on the right edge for jumping between sections (desktop).
- **Responsive layout** that collapses to a single-sided timeline on phones.

## Getting started

Requires **Node.js 24**. The version is pinned in `.nvmrc`.

```bash
nvm use
npm install
npm run dev
```

Then open <http://localhost:5173>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Serves the production build locally |

## Project structure

```
src/
  App.vue                  Page layout, timeline and scroll-driven theme switching
  components/GameEmblem.vue  Illustrated scene shown on each game card
  data/timeline.js         Eras, color palettes and game summaries
  plugins/vuetify.js       Builds one Vuetify theme per era
  styles.css               Fonts, transitions and layout styles
public/fonts/              Hylia Serif font file
```

To add or edit a game, change `src/data/timeline.js`. Each era's `colors` object drives both its Vuetify theme and the background glow.

## Game artwork

Each game card shows an original illustrated scene that evokes the game, drawn as inline SVG in `src/components/GameEmblem.vue`. The scenes are landscapes and objects only; they don't depict any Nintendo characters or logos. To use your own image instead, add a file to `src/assets/games/` named after the game's `slug` from `timeline.js`:

```
src/assets/games/ocarina-of-time.jpg
src/assets/games/tears-of-the-kingdom.webp
```

`.jpg`, `.jpeg`, `.png` and `.webp` files are supported. The card picks up the image automatically.

## Fonts

- **Headings:** [Hylia Serif](https://artsyomni.com/hyliaserif) (Beta v0.009) by Omni Jacala of Artsy Omni. Falls back to [Cinzel](https://fonts.google.com/specimen/Cinzel) while loading.
- **Body text:** [Inter](https://fonts.google.com/specimen/Inter).

Hylia Serif is free to use and download from its [official site](https://artsyomni.com/hyliaserif), and may not be distributed for profit. It's included in `public/fonts/` for convenience; the official site has the latest version. Hylia Serif is a fan-made approximation of the font from *Breath of the Wild* and is not affiliated with Nintendo.

## Disclaimer

This is an unofficial fan project. *The Legend of Zelda* and all related names are trademarks of Nintendo. This site is not affiliated with or endorsed by Nintendo.
