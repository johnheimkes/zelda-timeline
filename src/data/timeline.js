// Each era maps to a Vuetify theme of the same id (see src/plugins/vuetify.js).
// Each game's card art is an original scene in GameEmblem.vue, keyed by slug.
// A file at src/assets/games/<slug>.(jpg|png|webp) replaces it.
// Entries with type: 'event' are story events between games; they render as smaller cards
// with a `when` label instead of a year and platform.

export const eras = [
  {
    id: 'myth',
    title: 'The Era of Myth',
    subtitle: 'One timeline, before the split',
    blurb:
      'The goddess, the first hero and the forging of a legend. Every story that follows begins here, on a single unbroken path.',
    colors: {
      background: '#0b1322',
      surface: '#13203a',
      primary: '#8fd3ff',
      secondary: '#f0cc6b',
      glow: '#3d7ab8',
    },
    games: [
      {
        type: 'event',
        slug: 'event-war-against-demise',
        title: "The Goddess's War",
        when: 'Before Skyward Sword',
        summary:
          'The demon king Demise attacks the surface to seize the Triforce. The goddess Hylia lifts the surviving people into the sky on a piece of land, then seals Demise away at great cost to herself.',
      },
      {
        slug: 'skyward-sword',
        title: 'Skyward Sword',
        year: 2011,
        platform: 'Wii',
        summary:
          'Above the clouds on the floating island of Skyloft, a young knight follows his friend to the surface below. The goddess Hylia, the demon king Demise and the forging of the Master Sword set up the cycle that every later game repeats.',
      },
      {
        type: 'event',
        slug: 'event-founding-of-hyrule',
        title: 'The Kingdom of Hyrule Is Founded',
        when: 'After Skyward Sword',
        summary:
          "With Demise defeated, the people of Skyloft return to the surface. Their descendants found the Kingdom of Hyrule, and its royal family carries the goddess's bloodline.",
      },
      {
        slug: 'minish-cap',
        title: 'The Minish Cap',
        year: 2004,
        platform: 'Game Boy Advance',
        summary:
          'A talking cap lets Link shrink down to the size of the tiny Minish folk. He stops the sorcerer Vaati and learns where the Picori Blade came from, before it became the Four Sword.',
      },
      {
        slug: 'four-swords',
        title: 'Four Swords',
        year: 2002,
        platform: 'Game Boy Advance',
        summary:
          'Vaati breaks free and Link draws the Four Sword, which splits him into four copies. It is a cooperative multiplayer adventure about sealing the wind sorcerer away again.',
      },
      {
        type: 'event',
        slug: 'event-hyrulean-civil-war',
        title: 'The Hyrulean Civil War',
        when: 'Before Ocarina of Time',
        summary:
          'Fighting breaks out across Hyrule. During the war, a mother flees into the Kokiri Forest with her infant son, the future Hero of Time. In time, the king brings the land back under one rule.',
      },
      {
        slug: 'ocarina-of-time',
        title: 'Ocarina of Time',
        year: 1998,
        platform: 'Nintendo 64',
        summary:
          'Link travels back and forth across seven years to stop Ganondorf from taking the Triforce. Its ending can play out three ways, and each one starts its own branch of the timeline.',
        pivot: true,
      },
    ],
  },
  {
    id: 'downfall',
    title: 'The Hero Is Defeated',
    subtitle: 'Branch one: the Downfall timeline',
    blurb:
      'In this version, the Hero of Time loses to Ganon. The kingdom survives by sealing him away, and Hyrule slowly declines over the generations that follow.',
    colors: {
      background: '#0d150e',
      surface: '#16241a',
      primary: '#7bd36a',
      secondary: '#e2b33c',
      glow: '#3d7a35',
    },
    games: [
      {
        type: 'event',
        slug: 'event-imprisoning-war',
        title: 'The Imprisoning War',
        when: 'Before A Link to the Past',
        summary:
          "Ganon claims the Triforce and twists the Sacred Realm into a realm of darkness. As his evil spills into Hyrule, the Knights of Hyrule hold the line while the Seven Sages seal him inside the Sacred Realm. (A different war shares this name in Tears of the Kingdom's backstory.)",
      },
      {
        slug: 'a-link-to-the-past',
        title: 'A Link to the Past',
        year: 1991,
        platform: 'Super Nintendo',
        summary:
          'The wizard Agahnim is trying to break the seal on the Sacred Realm, which Ganon has twisted into the Dark World. Link moves between the Light and Dark Worlds to stop him.',
      },
      {
        slug: 'oracle-games',
        title: 'Oracle of Seasons & Ages',
        year: 2001,
        platform: 'Game Boy Color',
        summary:
          'Two linked adventures in Holodrum and Labrynna. In one, Link controls the seasons to rescue the Oracle Din. In the other, he travels through time to save the Oracle Nayru.',
      },
      {
        slug: 'links-awakening',
        title: "Link's Awakening",
        year: 1993,
        platform: 'Game Boy',
        summary:
          'After a shipwreck, Link washes up on Koholint Island, where the only way off is to wake the Wind Fish sleeping in a giant egg. It is a strange, dreamlike story with a bittersweet ending.',
      },
      {
        slug: 'a-link-between-worlds',
        title: 'A Link Between Worlds',
        year: 2013,
        platform: 'Nintendo 3DS',
        summary:
          "Generations later, the sorcerer Yuga traps Hyrule's sages in paintings. Link learns to merge into walls as a drawing and travels to Lorule, a dark mirror of Hyrule.",
      },
      {
        slug: 'tri-force-heroes',
        title: 'Tri Force Heroes',
        year: 2015,
        platform: 'Nintendo 3DS',
        summary:
          "Three heroes stack into totems to lift a fashion curse placed on Princess Styla of Hytopia. It is a light-hearted co-op side story that's mostly about outfits.",
      },
      {
        slug: 'echoes-of-wisdom',
        title: 'Echoes of Wisdom',
        year: 2024,
        platform: 'Nintendo Switch',
        summary:
          'Rifts are swallowing Hyrule and Link has gone missing, so Princess Zelda takes the lead. She copies objects and monsters as "echoes" and uses them to solve problems her own way.',
      },
      {
        type: 'event',
        slug: 'event-decline-of-hyrule',
        title: 'The Decline of Hyrule',
        when: 'Before The Legend of Zelda',
        summary:
          'Over generations the kingdom shrinks and splinters. Ganon returns and seizes the Triforce of Power, and before she is captured, Princess Zelda breaks the Triforce of Wisdom into eight pieces and hides them across the land.',
      },
      {
        slug: 'the-legend-of-zelda',
        title: 'The Legend of Zelda',
        year: 1986,
        platform: 'NES',
        summary:
          'This is where the series began. Hyrule has fallen into ruin, and Link explores an open overworld and its dungeons to collect the scattered Triforce of Wisdom and defeat Ganon.',
      },
      {
        slug: 'zelda-ii',
        title: 'Zelda II: The Adventure of Link',
        year: 1987,
        platform: 'NES',
        summary:
          'Ganon’s followers want Link’s blood to revive their master. Link explores side-scrolling palaces, levels up and wakes a princess Zelda who has been asleep for generations.',
      },
    ],
  },
  {
    id: 'child',
    title: 'The Child Timeline',
    subtitle: 'Branch two: the hero returns to childhood',
    blurb:
      'Link wins and is sent back to his childhood, where he warns the royal family about Ganondorf. The darkness comes back anyway, through twilight and shadow.',
    colors: {
      background: '#120d1c',
      surface: '#1e1630',
      primary: '#b48cf2',
      secondary: '#f08a4b',
      glow: '#6b3fa8',
    },
    games: [
      {
        type: 'event',
        slug: 'event-hero-departs',
        title: 'The Hero Leaves Hyrule',
        when: 'After Ocarina of Time',
        summary:
          'Sent back to his childhood with his memories intact, Link warns Princess Zelda about Ganondorf. Then he rides out of Hyrule in search of a lost friend, a journey that leads him to Termina.',
      },
      {
        slug: 'majoras-mask',
        title: "Majora's Mask",
        year: 2000,
        platform: 'Nintendo 64',
        summary:
          'In the parallel land of Termina, a falling moon will destroy everything in three days. Link replays those three days again and again, helping the townsfolk with their troubles and collecting masks.',
      },
      {
        type: 'event',
        slug: 'event-ganondorf-banished',
        title: "Ganondorf's Banishment",
        when: 'Before Twilight Princess',
        summary:
          'Ganondorf is captured and sentenced to death by the sages, but the Triforce of Power keeps him alive. Unable to kill him, the sages banish him to the Twilight Realm instead.',
      },
      {
        slug: 'twilight-princess',
        title: 'Twilight Princess',
        year: 2006,
        platform: 'GameCube / Wii',
        summary:
          'Twilight spreads over Hyrule and Link turns into a wolf inside it. With the imp Midna’s help he fights the usurper Zant, and behind Zant, Ganondorf.',
      },
      {
        slug: 'four-swords-adventures',
        title: 'Four Swords Adventures',
        year: 2004,
        platform: 'GameCube',
        summary:
          'A new Ganon is born and Vaati gets loose again. Four Links, split by the Four Sword, work together to rescue the shrine maidens and seal the evil away.',
      },
    ],
  },
  {
    id: 'adult',
    title: 'The Adult Timeline',
    subtitle: 'Branch three: the hero leaves',
    blurb:
      'Link wins and is sent back in time, leaving this future without a hero. When Ganon returns, the gods flood Hyrule and a new world of islands and sea grows up on the surface.',
    colors: {
      background: '#07141d',
      surface: '#0e2433',
      primary: '#4fc3f7',
      secondary: '#f6d77c',
      glow: '#1a6f9e',
    },
    games: [
      {
        type: 'event',
        slug: 'event-great-flood',
        title: 'The Great Flood',
        when: 'Before The Wind Waker',
        summary:
          'Ganon breaks free, and this time no hero appears. The gods flood Hyrule to stop him, sealing the kingdom beneath the waves. Survivors settle on the mountaintops, which become the islands of the Great Sea.',
      },
      {
        slug: 'the-wind-waker',
        title: 'The Wind Waker',
        year: 2002,
        platform: 'GameCube',
        summary:
          'Centuries after the flood, a boy from Outset Island sets sail to rescue his sister. Using a baton that controls the wind, he crosses the Great Sea and discovers the drowned kingdom beneath it.',
      },
      {
        slug: 'phantom-hourglass',
        title: 'Phantom Hourglass',
        year: 2007,
        platform: 'Nintendo DS',
        summary:
          'A ghost ship takes Tetra, and Link chases it across a new sea. He returns again and again to a timed temple and steers with a stylus-drawn map.',
      },
      {
        type: 'event',
        slug: 'event-new-hyrule',
        title: 'A New Hyrule',
        when: 'Before Spirit Tracks',
        summary:
          'Link and Tetra find a new land across the sea and found a kingdom there, which takes the name Hyrule. About a century later, it is crossed by spirit tracks.',
      },
      {
        slug: 'spirit-tracks',
        title: 'Spirit Tracks',
        year: 2009,
        platform: 'Nintendo DS',
        summary:
          'A century later, a new Hyrule is crossed by railways. An apprentice train engineer and the spirit of Princess Zelda team up to restore the tracks that seal away the Demon King.',
      },
    ],
  },
  {
    id: 'modern',
    title: 'The Era of Wilds',
    subtitle: 'Far in the future, branch unknown',
    blurb:
      'So much time has passed that Hyrule’s history has worn down into legend. Nintendo has said these games come last, but hasn’t tied them to any branch.',
    colors: {
      background: '#08130f',
      surface: '#10231c',
      primary: '#4fe0b5',
      secondary: '#d9b45a',
      glow: '#1f8a6c',
    },
    games: [
      {
        type: 'event',
        slug: 'event-founding-imprisoning-war',
        title: 'The Imprisoning War (Founding Age)',
        when: 'Long before Breath of the Wild',
        summary:
          "In Hyrule's founding age, the first king of Hyrule and his allies face the Demon King Ganondorf. At great cost, he is sealed deep beneath what becomes Hyrule Castle. Tears of the Kingdom uncovers this story.",
      },
      {
        type: 'event',
        slug: 'event-first-calamity',
        title: 'The First Calamity',
        when: '10,000 years before Breath of the Wild',
        summary:
          "Calamity Ganon rises, and the Sheikah's ancient machines, the Guardians and the Divine Beasts, help a hero and a princess defeat it. Afterward, the machines are buried and the Sheikah fall out of the king's favor.",
      },
      {
        type: 'event',
        slug: 'event-great-calamity',
        title: 'The Great Calamity',
        when: '100 years before Breath of the Wild',
        summary:
          'Calamity Ganon returns and turns the unearthed machines against Hyrule. The kingdom falls, Link is placed in a century-long sleep to heal, and Princess Zelda holds Ganon inside Hyrule Castle alone.',
      },
      {
        slug: 'breath-of-the-wild',
        title: 'Breath of the Wild',
        year: 2017,
        platform: 'Switch / Wii U',
        summary:
          'Link wakes after a hundred years of sleep to find Hyrule in ruins after the Calamity. He climbs, glides and explores freely, gathering his lost memories before facing Calamity Ganon.',
      },
      {
        type: 'event',
        slug: 'event-upheaval',
        title: 'The Upheaval',
        when: 'Before Tears of the Kingdom',
        summary:
          'While Hyrule rebuilds, Link and Zelda investigate a strange gloom beneath Hyrule Castle. Something stirs below, and the land is torn apart as islands rise into the sky.',
      },
      {
        slug: 'tears-of-the-kingdom',
        title: 'Tears of the Kingdom',
        year: 2023,
        platform: 'Nintendo Switch',
        summary:
          'Ganondorf wakes up beneath Hyrule Castle, islands rise into the sky and a vast dark Depths opens below. Link uses ancient Zonai abilities to build machines and uncover the story of Hyrule’s founding.',
      },
    ],
  },
]

export const sideStories = [
  {
    title: 'Hyrule Warriors: Age of Calamity',
    year: 2020,
    note: 'A musou-style alternate history of the Calamity, branching off from Breath of the Wild.',
  },
  {
    title: 'Hyrule Warriors: Age of Imprisonment',
    year: 2025,
    note: 'Set during the ancient Imprisoning War from Tears of the Kingdom’s backstory.',
  },
]
