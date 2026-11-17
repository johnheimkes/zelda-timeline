<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { mdiChevronDown, mdiMapMarkerPath } from '@mdi/js'
import GameEmblem from './components/GameEmblem.vue'
import RuneField from './components/RuneField.vue'
import StarField from './components/StarField.vue'
import { eras, sideStories } from './data/timeline'

const theme = useTheme()
const { mdAndUp } = useDisplay()

const activeEraId = ref(eras[0].id)
const activeEra = computed(() => eras.find((e) => e.id === activeEraId.value))
const sectionRefs = ref([])
const heroRef = ref(null)
// True once the title section has mostly scrolled away. It blurs the starry background and
// shows the current-era indicators, which stay hidden while you're still at the title.
const pastHero = ref(false)
let observer
let heroObserver

// Switch the Vuetify theme to whichever era section crosses the middle of the screen.
const setEra = (id) => {
  if (id === activeEraId.value) return
  activeEraId.value = id
  theme.change(id)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => setEra(e.target.dataset.era))
    },
    { rootMargin: '-50% 0px -50% 0px' },
  )
  // Refs can briefly be null during a hot reload, so skip anything that isn't mounted.
  sectionRefs.value.filter(Boolean).forEach((el) => observer.observe(el))

  // The root is the bottom half of the screen, so the hero stops intersecting it
  // once its bottom edge rises past the middle.
  heroObserver = new IntersectionObserver(
    ([entry]) => {
      pastHero.value = !entry.isIntersecting
      // Back at the title, always show the first era's colors. A jump to the top
      // (Home key, fast scroll) can skip every section, leaving a later era's theme.
      if (entry.isIntersecting) setEra(eras[0].id)
    },
    { rootMargin: '-50% 0px 0px 0px' },
  )
  if (heroRef.value) heroObserver.observe(heroRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  heroObserver?.disconnect()
})

const scrollTo = (id) =>
  document.getElementById(`era-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const branches = eras.slice(1, 4)
</script>

<template>
  <v-app>
    <!-- One glow layer per era; they cross-fade as the active era changes. -->
    <div class="ambient" aria-hidden="true">
      <div
        v-for="era in eras"
        :key="era.id"
        class="ambient__layer"
        :class="{ 'ambient__layer--on': era.id === activeEraId }"
        :style="{
          background: `radial-gradient(ellipse at 20% 10%, ${era.colors.glow}55, transparent 55%),
                       radial-gradient(ellipse at 85% 90%, ${era.colors.secondary}22, transparent 50%)`,
        }"
      />
    </div>

    <!-- Stars sit behind the drifting patterns; both blur once you're into the timeline. -->
    <div class="backdrop" :class="{ 'backdrop--blurred': pastHero }" aria-hidden="true">
      <StarField />
      <RuneField />
    </div>

    <v-app-bar flat density="comfortable" class="app-bar">
      <v-app-bar-title class="brand">Hyrule Chronicle</v-app-bar-title>
      <template #append>
        <v-fade-transition>
          <v-chip
            v-if="pastHero"
            color="primary"
            variant="tonal"
            class="mr-2 era-chip"
            :prepend-icon="mdiMapMarkerPath"
          >
            {{ activeEra.title }}
          </v-chip>
        </v-fade-transition>
      </template>
    </v-app-bar>

    <!-- Era jump list, fixed on the right on wider screens. -->
    <nav v-if="mdAndUp" class="era-nav" aria-label="Eras">
      <button
        v-for="era in eras"
        :key="era.id"
        class="era-nav__item"
        :class="{ 'era-nav__item--on': pastHero && era.id === activeEraId }"
        :aria-current="pastHero && era.id === activeEraId ? 'true' : undefined"
        :style="{ '--dot': era.colors.primary }"
        @click="scrollTo(era.id)"
      >
        <span class="era-nav__label">{{ era.title }}</span>
        <span class="era-nav__dot" />
      </button>
    </nav>

    <v-main>
      <section ref="heroRef" class="hero">
        <v-container class="text-center">
          <p class="eyebrow text-secondary">The official chronology</p>
          <h1 class="hero__title">The Legend of Zelda<br />Timeline</h1>
          <p class="hero__lede">
            From the skies of Skyloft to the floating islands of Tears of the Kingdom. One story,
            split into three after Ocarina of Time. Scroll to follow it from the beginning.
          </p>
          <v-btn
            color="primary"
            variant="tonal"
            size="large"
            :append-icon="mdiChevronDown"
            class="mt-6"
            @click="scrollTo(eras[0].id)"
          >
            Begin the journey
          </v-btn>
        </v-container>
      </section>

      <section
        v-for="era in eras"
        :id="`era-${era.id}`"
        :key="era.id"
        ref="sectionRefs"
        :data-era="era.id"
        class="era"
      >
        <v-container class="era__container">
          <header class="era__header text-center">
            <p class="eyebrow text-secondary">{{ era.subtitle }}</p>
            <h2 class="era__title">{{ era.title }}</h2>
            <p class="era__blurb">{{ era.blurb }}</p>
          </header>

          <v-timeline
            :side="mdAndUp ? undefined : 'end'"
            :align="mdAndUp ? 'center' : 'start'"
            line-color="primary"
            line-thickness="2"
            truncate-line="both"
          >
            <v-timeline-item
              v-for="(game, i) in era.games"
              :key="game.slug"
              :dot-color="game.type === 'event' ? 'secondary' : 'primary'"
              :fill-dot="true"
              :size="game.type === 'event' ? 'x-small' : 'small'"
            >
              <template v-if="mdAndUp" #opposite>
                <div v-if="game.type === 'event'" class="event-when" :class="i % 2 ? 'text-left' : 'text-right'">
                  {{ game.when }}
                </div>
                <div v-else class="year" :class="i % 2 ? 'text-left' : 'text-right'">
                  <span class="text-secondary">{{ game.year }}</span>
                  <div class="platform">{{ game.platform }}</div>
                </div>
              </template>

              <!-- A story event between games: compact, no artwork. -->
              <v-card v-if="game.type === 'event'" class="event-card" rounded="lg" variant="outlined">
                <v-card-item>
                  <div class="event-card__label text-secondary">Between games</div>
                  <v-card-title class="event-card__title">{{ game.title }}</v-card-title>
                  <v-card-subtitle v-if="!mdAndUp">{{ game.when }}</v-card-subtitle>
                </v-card-item>
                <v-card-text class="event-card__text">{{ game.summary }}</v-card-text>
              </v-card>

              <v-card v-else class="game-card" rounded="lg" elevation="8">
                <GameEmblem :game="game" :colors="era.colors" />
                <v-card-item>
                  <v-card-title class="game-card__title">{{ game.title }}</v-card-title>
                  <v-card-subtitle v-if="!mdAndUp">
                    {{ game.year }} · {{ game.platform }}
                  </v-card-subtitle>
                </v-card-item>
                <v-card-text class="game-card__text">{{ game.summary }}</v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>

          <!-- The split after Ocarina of Time. -->
          <div v-if="era.id === 'myth'" class="split">
            <!-- The site's three-way branch mark (same as the favicon), one color per branch. -->
            <svg class="split__icon" viewBox="0 0 64 64" aria-hidden="true">
              <g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M32 36 C32 26 16 26 16 14" stroke="#7bd36a" />
                <path d="M32 36 V12" stroke="#b48cf2" />
                <path d="M32 36 C32 26 48 26 48 14" stroke="#4fc3f7" />
                <path d="M32 58 V36" stroke="#f0cc6b" />
              </g>
              <circle cx="16" cy="12" r="4.5" fill="#7bd36a" />
              <circle cx="32" cy="10" r="4.5" fill="#b48cf2" />
              <circle cx="48" cy="12" r="4.5" fill="#4fc3f7" />
              <circle cx="32" cy="36" r="5" fill="#f0cc6b" />
            </svg>
            <h3 class="split__title">The timeline splits into three</h3>
            <p class="split__hint">Choose a path to follow its story</p>
            <v-row class="mt-2" justify="center">
              <v-col v-for="b in branches" :key="b.id" cols="12" sm="4">
                <v-card
                  variant="outlined"
                  rounded="lg"
                  class="split__card"
                  role="button"
                  tabindex="0"
                  :style="{ borderColor: b.colors.primary, '--branch': b.colors.primary }"
                  @click="scrollTo(b.id)"
                  @keydown.enter.prevent="scrollTo(b.id)"
                  @keydown.space.prevent="scrollTo(b.id)"
                >
                  <v-card-title :style="{ color: b.colors.primary }">{{ b.title }}</v-card-title>
                  <v-card-subtitle>{{ b.subtitle }}</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-container>
      </section>

      <section class="coda">
        <v-container class="text-center">
          <p class="eyebrow text-secondary">Outside the main line</p>
          <h2 class="era__title">Side stories</h2>
          <v-row justify="center" class="mt-4">
            <v-col v-for="s in sideStories" :key="s.title" cols="12" sm="6" md="5">
              <v-card rounded="lg" variant="tonal" color="primary" class="h-100">
                <v-card-title class="text-wrap">{{ s.title }}</v-card-title>
                <v-card-subtitle>{{ s.year }}</v-card-subtitle>
                <v-card-text class="text-medium-emphasis">{{ s.note }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <p class="footnote">
            A fan-made chronology based on Nintendo's published timeline. The Legend of Zelda is a
            trademark of Nintendo; this site is not affiliated with or endorsed by Nintendo.
          </p>
        </v-container>
      </section>
    </v-main>
  </v-app>
</template>
