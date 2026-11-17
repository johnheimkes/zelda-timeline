# Zelda Timeline

A single-page, fan-made guide to the official chronology of *The Legend of Zelda* series. Scroll from *Skyward Sword* to *Tears of the Kingdom* and follow the story as it splits into three branches after *Ocarina of Time*.

Live at <https://zelda.heimk.es>. Built with [Vue 3](https://vuejs.org/), [Vuetify 3](https://vuetifyjs.com/) and [Vite](https://vite.dev/).

## Features

- **Vertical timeline** of every mainline game, each with a year, platform and short summary.
- **Story events between games**, such as the Imprisoning War and the Great Flood, shown as smaller dashed cards with a "when" label.
- **Era-based color themes.** The page fades between five dark palettes as you scroll:

  | Era | Palette |
  | --- | --- |
  | The Era of Myth | Sky blue and gold |
  | The Hero Is Defeated | Forest green and gold |
  | The Child Timeline | Twilight purple and orange |
  | The Adult Timeline | Ocean blue and sand |
  | The Era of Wilds | Teal-green and gold |

- **Animated background.** A twinkling star field with original ancient-tech patterns drifting up in front of it, tinted with the current era's color. Once you scroll past the title, the background blurs slightly and the drift pauses. Visitors who prefer reduced motion get a still background.
- **Timeline split section** after *Ocarina of Time*, with a button for each branch (keyboard accessible).
- **Era navigation** dots on the right edge for jumping between sections (desktop).
- **Link previews** for Discord, iMessage and Slack, plus a favicon and iOS home-screen icon.
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
| `npm run icons` | Re-renders the favicon PNGs and link-preview image (macOS only) |
| `npm run deploy` | Builds and uploads the site from your machine (manual fallback, see below) |

## Deploying

**Every push to `main` deploys automatically.** The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the site on Node 24 and syncs it to `/var/www/zelda-timeline` on the droplet. It reads these repository secrets:

| Secret | Holds |
| --- | --- |
| `DEPLOY_SSH_KEY` | A dedicated deploy key that the droplet restricts to the site folder with `rrsync` |
| `DEPLOY_HOST` | The droplet's address |
| `DEPLOY_USER` | The SSH login the deploy key belongs to |
| `DEPLOY_KNOWN_HOSTS` | The droplet's pinned SSH host key line, so the workflow only connects to the real server |

**Every pull request is built first.** `.github/workflows/build.yml` runs `npm ci` and `npm run build` on each pull request, including Dependabot's, without deploying or touching any secrets. `.github/dependabot.yml` opens weekly update pull requests for npm packages and GitHub Actions, grouping minor and patch updates. Both workflows pin their actions to exact commits, which Dependabot keeps current. Merge a pull request only after its build passes, since merging to `main` deploys.

`npm run deploy` uploads whatever is on your machine, including uncommitted changes, and overwrites what GitHub deployed. Keep it as a manual fallback for when the workflow can't run. It reads `DEPLOY_USER` and `DEPLOY_HOST` from the environment or from a `deploy.env.local` file in the project root, which git ignores:

```bash
DEPLOY_USER=your-login
DEPLOY_HOST=your-server-address
```

The Apache configuration for the site lives in `deploy/apache/`:

- `zelda.heimk.es.conf` is the virtual host. certbot manages the matching HTTPS virtual host on the server.
- `zelda-timeline-cache.conf` sets caching headers: a year for the hashed files in `/assets/`, a day for icons, images and fonts, and a fresh check for `index.html` so deploys show up right away.

## Project structure

```
src/
  App.vue                     Page layout, timeline, scroll-driven themes and background blur
  components/GameEmblem.vue   Illustrated scene shown on each game card
  components/StarField.vue    Twinkling star background
  components/RuneField.vue    Drifting ancient-tech patterns
  data/timeline.js            Eras, palettes, games and between-game events
  plugins/vuetify.js          One Vuetify theme per era, plus SVG icons
  styles.css                  Fonts, transitions and layout styles
public/                       Favicons, link-preview image and the Hylia Serif font
scripts/render-icons.mjs      Renders the favicon PNGs and link-preview image
scripts/deploy.sh             Manual build-and-upload fallback
deploy/apache/                Apache configuration for the droplet
```

To add or edit a game, change `src/data/timeline.js`. Each era's `colors` object drives both its Vuetify theme and the background glow. To add an event between games, insert an entry with `type: 'event'`, a `title`, a `when` label and a `summary` where it belongs in the list.

## Game artwork

Each game card shows an original illustrated scene that evokes the game, drawn as inline SVG in `src/components/GameEmblem.vue`. The scenes are landscapes and objects only; they don't depict any Nintendo characters or logos. To use your own image instead, add a file to `src/assets/games/` named after the game's `slug` from `timeline.js`:

```
src/assets/games/ocarina-of-time.jpg
src/assets/games/tears-of-the-kingdom.webp
```

`.jpg`, `.jpeg`, `.png` and `.webp` files are supported. The card picks up the image automatically.

## Fonts

- **Headings:** [Hylia Serif](https://artsyomni.com/hyliaserif) (Beta v0.009) by Omni Jacala of Artsy Omni. It's preloaded, with Georgia as the fallback.
- **Body text:** [Inter](https://rsms.me/inter/), self-hosted through the [`@fontsource/inter`](https://fontsource.org/fonts/inter) package (SIL Open Font License), so the page makes no requests to Google or any other third party.

Hylia Serif is free to use and download from its [official site](https://artsyomni.com/hyliaserif), and may not be distributed for profit. It's included in `public/fonts/` for convenience; the official site has the latest version. Hylia Serif is a fan-made approximation of the font from *Breath of the Wild* and is not affiliated with Nintendo.

## Disclaimer

This is an unofficial fan project. *The Legend of Zelda* and all related names are trademarks of Nintendo. This site is not affiliated with or endorsed by Nintendo.
