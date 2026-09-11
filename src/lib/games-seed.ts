// PlayVault launch catalog — 54 games.
// Every URL verified 2026-09 for iframe embeddability (Sec-Fetch-Dest: iframe + XFO/CSP checks)
// plus in-browser boot tests. Sources:
//  - direct official .io / official sites (rock solid)
//  - eaglercraft.q13x.com (direct EaglercraftX clients, no XFO)
//  - ubg365.github.io (self-hosted games on GitHub Pages, no XFO)
//  - open-source games on GitHub Pages (2048, floppybird, react-tetris, tower)
// Admins can hot-swap any embedUrl from the admin panel when a mirror dies.

export type SeedGame = {
  slug: string
  title: string
  description: string
  category: string
  embedUrl: string
  thumbUrl: string | null
  emoji: string
  featured: boolean
  sortOrder: number
}

const UBG = "https://ubg365.github.io/"

export const SEED_GAMES: SeedGame[] = [
  // ---------- Minecraft / Sandbox ----------
  {
    slug: "eaglercraft-1-12-2",
    title: "Eaglercraft 1.12.2",
    description:
      "Minecraft 1.12.2 in your browser, running the fast WebAssembly (wasmGC) client. Create worlds, build, survive and join multiplayer servers.",
    category: "Sandbox",
    embedUrl: "https://eaglercraft.q13x.com/1.12.2/wasm/?retina=true",
    thumbUrl: "https://eaglercraft.com/steve.png",
    emoji: "🧱",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "eaglercraft-1-8",
    title: "Eaglercraft 1.8",
    description:
      "The classic EaglercraftX 1.8.8 client — the most stable browser Minecraft. Best for older servers and PvP.",
    category: "Sandbox",
    embedUrl: "https://eaglercraft.q13x.com/1.8.8/wasm/?retina=true",
    thumbUrl: "https://eaglercraft.com/steve.png",
    emoji: "⛏️",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "bloxd-io",
    title: "Bloxd.io",
    description:
      "Minecraft-style voxel world with mini-games: parkour, creative, Doodle Cube and PvP modes. Instant play, no download.",
    category: "Sandbox",
    embedUrl: "https://bloxd.io",
    thumbUrl: "https://bloxd.io/textures/miscImages/bloxd_io_free_online_games.jpg",
    emoji: "🟩",
    featured: false,
    sortOrder: 3,
  },

  // ---------- FPS / Battle Royale ----------
  {
    slug: "krunker",
    title: "Krunker",
    description:
      "The most popular browser FPS. Pixel-art style, buttery movement, custom classes and active servers worldwide.",
    category: "FPS",
    embedUrl: "https://krunker.io",
    thumbUrl: "https://assets.krunker.io/promo/og.png",
    emoji: "🎯",
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "shell-shockers",
    title: "Shell Shockers",
    description:
      "Egg-based multiplayer FPS. Crack the other team open with shotguns, rifles and RPGs in shell-shocked arenas.",
    category: "FPS",
    embedUrl: "https://shellshock.io",
    thumbUrl: null,
    emoji: "🥚",
    featured: true,
    sortOrder: 5,
  },
  {
    slug: "zombs-royale",
    title: "Zombs Royale",
    description:
      "100-player 2D battle royale. Drop in, loot up, and be the last egg standing in solo, duo or squad mode.",
    category: "Battle Royale",
    embedUrl: "https://zombsroyale.io",
    thumbUrl: "https://zombsroyale.io/asset/image/share-card.png",
    emoji: "👑",
    featured: true,
    sortOrder: 6,
  },
  {
    slug: "buildroyale",
    title: "BuildRoyale.io",
    description:
      "Battle royale with Fortnite-style building. Gather resources, throw up walls mid-fight and out-build your rivals.",
    category: "Battle Royale",
    embedUrl: "https://buildroyale.io",
    thumbUrl: "https://buildroyale.io/buildart/thumbnail.png",
    emoji: "🏗️",
    featured: false,
    sortOrder: 7,
  },
  {
    slug: "voxiom-io",
    title: "Voxiom.io",
    description:
      "Minecraft meets battle royale: a 3D voxel shooter where you mine, build and blast your way to victory. The spiritual replacement for 1v1.LOL.",
    category: "FPS",
    embedUrl: "https://voxiom.io",
    thumbUrl: null,
    emoji: "🔫",
    featured: true,
    sortOrder: 8,
  },
  {
    slug: "deadshot-io",
    title: "Deadshot.io",
    description:
      "Fast-paced 3D multiplayer shooter with clean gunplay, custom lobbies and competitive matches.",
    category: "FPS",
    embedUrl: "https://deadshot.io",
    thumbUrl: "https://deadshot.io/promo/thumbnail.png",
    emoji: "💥",
    featured: false,
    sortOrder: 9,
  },
  {
    slug: "kirka-io",
    title: "Kirka.io",
    description:
      "Blocky FPS with its own tight gunplay. Team deathmatch, infected mode and parkour runs.",
    category: "FPS",
    embedUrl: "https://kirka.io",
    thumbUrl: null,
    emoji: "🪖",
    featured: false,
    sortOrder: 10,
  },
  {
    slug: "repuls-io",
    title: "Repuls.io",
    description:
      "Sci-fi arena FPS with jetpacks, plasma rifles and objective modes. Surprisingly deep movement system.",
    category: "FPS",
    embedUrl: "https://repuls.io",
    thumbUrl: "https://repuls.io/img/thumb_iogame_repuls.jpg",
    emoji: "🚀",
    featured: false,
    sortOrder: 11,
  },
  {
    slug: "rocket-bot-royale",
    title: "Rocket Bot Royale",
    description:
      "Rocket-powered tank battle royale. Bounce around destructible islands, upgrade your tank and blast everyone.",
    category: "Battle Royale",
    embedUrl: "https://rocketbotroyale.io",
    thumbUrl: null,
    emoji: "🤖",
    featured: false,
    sortOrder: 12,
  },

  // ---------- Multiplayer .io ----------
  {
    slug: "smash-karts",
    title: "Smash Karts",
    description:
      "3D kart battle arena with rockets, machine guns and grenades. Insanely fun with friends.",
    category: "io",
    embedUrl: "https://smashkarts.io",
    thumbUrl: "https://smashkarts.io/images/icon-144.png",
    emoji: "🏎️",
    featured: true,
    sortOrder: 13,
  },
  {
    slug: "starblast-io",
    title: "Starblast.io",
    description:
      "Mine asteroids, upgrade your ship through 7 tiers and fight in a shared galaxy. Classic space .io.",
    category: "io",
    embedUrl: "https://starblast.io",
    thumbUrl: "https://starblast.io/static/img/starblast.png?2",
    emoji: "🌌",
    featured: false,
    sortOrder: 14,
  },
  {
    slug: "diep-io",
    title: "Diep.io",
    description:
      "The original tank shooter .io. Farm shapes, level up your tank and choose from dozens of upgrade paths.",
    category: "io",
    embedUrl: "https://diep.io",
    thumbUrl: null,
    emoji: "🔵",
    featured: false,
    sortOrder: 15,
  },
  {
    slug: "sploop-io",
    title: "Sploop.io",
    description:
      "Tribal-building .io — place turrets, spikes and windmills while surviving enemy tribes.",
    category: "io",
    embedUrl: "https://sploop.io",
    thumbUrl: "https://sploop.io/img/banners/banner-1920x1080.png",
    emoji: "🔱",
    featured: false,
    sortOrder: 16,
  },
  {
    slug: "territorial-io",
    title: "Territorial.io",
    description:
      "Massive multiplayer map-conquest strategy. Expand your territory across real-world maps against 500+ players.",
    category: "Strategy",
    embedUrl: "https://territorial.io",
    thumbUrl: null,
    emoji: "🗺️",
    featured: false,
    sortOrder: 17,
  },
  {
    slug: "paper-io-2",
    title: "Paper.io 2",
    description:
      "Claim territory by drawing your zone — cut off rivals and don't get clipped. The sequel with smoother movement.",
    category: "io",
    embedUrl: "https://paper-io.com",
    thumbUrl: "https://framerusercontent.com/images/cKiSnoz2B6fJXIxssj9GA1gg.jpg",
    emoji: "📄",
    featured: false,
    sortOrder: 18,
  },
  {
    slug: "hole-io",
    title: "Hole.io",
    description:
      "Swallow a whole city as a growing black hole. Devour cars, buildings and other players.",
    category: "io",
    embedUrl: "https://hole-io.com",
    thumbUrl: "https://framerusercontent.com/images/cKiSnoz2B6fJXIxssj9GA1gg.jpg",
    emoji: "🕳️",
    featured: false,
    sortOrder: 19,
  },
  {
    slug: "little-big-snake",
    title: "Little Big Snake",
    description:
      "The best slither-style snake game — eat bugs, grow huge, and glide through caves as a flying beetle.",
    category: "io",
    embedUrl: "https://littlebigsnake.io",
    thumbUrl: "https://littlebigsnake.com/img/sharing_img.png",
    emoji: "🐍",
    featured: false,
    sortOrder: 20,
  },
  {
    slug: "wings-io",
    title: "Wings.io",
    description:
      "Dogfight in a tiny jet. Grab weapon pickups and shoot everyone out of the sky.",
    category: "io",
    embedUrl: "https://wings.io",
    thumbUrl: "https://wings.io/images/thumbnail.png",
    emoji: "✈️",
    featured: false,
    sortOrder: 21,
  },
  {
    slug: "defly-io",
    title: "Defly.io",
    description:
      "Helicopter territory game — draw walls, build towers and claim the map while dodging bullets.",
    category: "io",
    embedUrl: "https://defly.io",
    thumbUrl: "https://defly.io/img/facebook-share.png",
    emoji: "🚁",
    featured: false,
    sortOrder: 22,
  },
  {
    slug: "superhex-io",
    title: "Superhex.io",
    description:
      "Hex-based territory capture. Slice across enemy trails to take them down — risk it all for big land.",
    category: "io",
    embedUrl: "https://superhex.io",
    thumbUrl: "https://superhex.io/img/banniere1200x675.png",
    emoji: "⬡",
    featured: false,
    sortOrder: 23,
  },
  {
    slug: "taming-io",
    title: "Taming.io",
    description:
      "Pokémon-style .io survival: tame wild creatures, level them up and battle bosses with your pet army.",
    category: "io",
    embedUrl: "https://taming.io",
    thumbUrl: "https://taming.io/img/banner.png?5",
    emoji: "🐾",
    featured: false,
    sortOrder: 24,
  },

  // ---------- Racing ----------
  {
    slug: "polytrack",
    title: "PolyTrack",
    description:
      "Low-poly time-attack racing with TrackMania-style physics, ghost replays and a full level editor.",
    category: "Racing",
    embedUrl: "https://poly-track.io",
    thumbUrl: "https://poly-track.io/data/image/options/polytrack-banner.jpg",
    emoji: "🏁",
    featured: true,
    sortOrder: 25,
  },
  {
    slug: "moto-x3m",
    title: "Moto X3M",
    description:
      "Motorcycle obstacle madness — backflips, explosions and 22 levels of brutal physics puzzles.",
    category: "Racing",
    embedUrl: "https://moto-x3m.io",
    thumbUrl: "https://moto-x3m.io/data/image/image.jpeg",
    emoji: "🏍️",
    featured: false,
    sortOrder: 26,
  },
  {
    slug: "slope",
    title: "Slope",
    description:
      "Roll a ball down an endless neon slope at insane speed. One mistake and it's over.",
    category: "Racing",
    embedUrl: "https://slopegame.io",
    thumbUrl: "https://slopegame.io/upload/imgs/slope-game1.png",
    emoji: "⛷️",
    featured: true,
    sortOrder: 27,
  },
  {
    slug: "eggy-car",
    title: "Eggy Car",
    description:
      "Drive carefully — you're carrying an egg. Balance over hills and grab coins to unlock better cars.",
    category: "Racing",
    embedUrl: "https://eggy-car.io",
    thumbUrl: "https://mariterbang.io/download/KmY9T2zq.jpg",
    emoji: "🥚",
    featured: false,
    sortOrder: 28,
  },
  {
    slug: "drift-boss",
    title: "Drift Boss",
    description:
      "One-button drifting — hold to turn, release to go straight. How long can you keep the slide going?",
    category: "Racing",
    embedUrl: UBG + "drift-boss/",
    thumbUrl: null,
    emoji: "💨",
    featured: false,
    sortOrder: 29,
  },
  {
    slug: "madalin-stunt-cars-2",
    title: "Madalin Stunt Cars 2",
    description:
      "Pick a supercar and hit impossible loops, ramps and wall rides in a giant stunt playground.",
    category: "Racing",
    embedUrl: UBG + "madalin-stunt-cars-2/play.html",
    thumbUrl: null,
    emoji: "🚗",
    featured: false,
    sortOrder: 30,
  },
  {
    slug: "death-run-3d",
    title: "Death Run 3D",
    description:
      "Sprint through a neon tunnel of moving hazards at full speed. Reflexes or death.",
    category: "Racing",
    embedUrl: UBG + "death-run-3d/",
    thumbUrl: null,
    emoji: "🏃",
    featured: false,
    sortOrder: 31,
  },

  // ---------- 2 Player ----------
  {
    slug: "rooftop-snipers",
    title: "Rooftop Snipers",
    description:
      "Hilarious 2-player sniper duel on a rooftop. One shot, one bounce — knock your friend off the edge.",
    category: "2 Player",
    embedUrl: UBG + "rooftop-snipers/",
    thumbUrl: null,
    emoji: "🤼",
    featured: false,
    sortOrder: 32,
  },
  {
    slug: "getaway-shootout",
    title: "Getaway Shootout",
    description:
      "Two rivals, one escape. Race to the extraction point while jumping, grabbing and sabotaging each other.",
    category: "2 Player",
    embedUrl: UBG + "getaway-shootout/",
    thumbUrl: null,
    emoji: "🔫",
    featured: false,
    sortOrder: 33,
  },
  {
    slug: "basketball-legends",
    title: "Basketball Legends",
    description:
      "1v1 arcade basketball with NBA-style moves — crossovers, dunks and blocks. Play vs CPU or a friend.",
    category: "2 Player",
    embedUrl: UBG + "basketball-legends/play.html",
    thumbUrl: null,
    emoji: "⛹️",
    featured: false,
    sortOrder: 34,
  },
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    description:
      "The classic. Play against a friend or the computer on a clean neon board.",
    category: "2 Player",
    embedUrl: UBG + "tic-tac-toe/",
    thumbUrl: null,
    emoji: "❌",
    featured: false,
    sortOrder: 35,
  },

  // ---------- Platformer ----------
  {
    slug: "vex-5",
    title: "Vex 5",
    description:
      "The stickman obstacle legend — spikes, saws and death traps across acts of increasing pain.",
    category: "Platformer",
    embedUrl: UBG + "vex-5/",
    thumbUrl: null,
    emoji: "💀",
    featured: true,
    sortOrder: 36,
  },
  {
    slug: "run-3",
    title: "Run 3",
    description:
      "Run, jump and rotate through tunnels in space. Play as the Runner or skater through 80+ levels.",
    category: "Platformer",
    embedUrl: UBG + "run-3/",
    thumbUrl: null,
    emoji: "🚶",
    featured: false,
    sortOrder: 37,
  },

  // ---------- Arcade ----------
  {
    slug: "super-mario-64",
    title: "Super Mario 64",
    description:
      "The legendary N64 classic, fully playable in the browser. Collect stars and save Princess Peach.",
    category: "Arcade",
    embedUrl: UBG + "super-mario-64/play.html",
    thumbUrl: null,
    emoji: "🍄",
    featured: true,
    sortOrder: 38,
  },
  {
    slug: "friday-night-funkin",
    title: "Friday Night Funkin'",
    description:
      "The rhythm-game phenomenon. Hit the arrows on beat to win rap battles and impress Girlfriend.",
    category: "Arcade",
    embedUrl: UBG + "friday-night-funkin/play.html",
    thumbUrl: null,
    emoji: "🎤",
    featured: true,
    sortOrder: 39,
  },
  {
    slug: "pacman",
    title: "Pac-Man",
    description:
      "The official Google Doodle version of the 1980 arcade legend. Waka waka.",
    category: "Arcade",
    embedUrl: "https://www.google.com/logos/2010/pacman10-i.html",
    thumbUrl: null,
    emoji: "🟡",
    featured: false,
    sortOrder: 40,
  },
  {
    slug: "flappy-bird",
    title: "Flappy Bird",
    description:
      "The open-source remake of the infamous one-tap bird game. One pipe at a time.",
    category: "Arcade",
    embedUrl: "https://nebez.github.io/floppybird/",
    thumbUrl: "https://nebezb.com/floppybird/assets/thumb.png",
    emoji: "🐤",
    featured: false,
    sortOrder: 41,
  },
  {
    slug: "wheely",
    title: "Wheely",
    description:
      "Guide the little red car through puzzle levels — press buttons, flip switches, dodge traps.",
    category: "Arcade",
    embedUrl: UBG + "wheely/",
    thumbUrl: null,
    emoji: "🚙",
    featured: false,
    sortOrder: 42,
  },
  {
    slug: "stack-ball",
    title: "Stack Ball",
    description:
      "Smash through helix platforms — but never hit the black zones. Simple, hypnotic, brutal.",
    category: "Arcade",
    embedUrl: UBG + "stack-ball/",
    thumbUrl: null,
    emoji: "🔴",
    featured: false,
    sortOrder: 43,
  },
  {
    slug: "stack",
    title: "Stack",
    description:
      "Stack moving blocks into the sky — nail perfect drops to keep the tower growing.",
    category: "Arcade",
    embedUrl: UBG + "stack/",
    thumbUrl: null,
    emoji: "🏢",
    featured: false,
    sortOrder: 44,
  },
  {
    slug: "worlds-hardest-game",
    title: "World's Hardest Game",
    description:
      "Move your red square through moving blue dots to collect coins. It earns its name.",
    category: "Arcade",
    embedUrl: UBG + "worlds-hardest-game/",
    thumbUrl: null,
    emoji: "🟥",
    featured: false,
    sortOrder: 45,
  },
  {
    slug: "paper-fighter-3d",
    title: "Paper Fighter 3D",
    description:
      "Paper-themed 3D fighting game — jab, combo and special-move your way through opponents.",
    category: "Arcade",
    embedUrl: UBG + "paper-fighter-3d/play.html",
    thumbUrl: null,
    emoji: "🥊",
    featured: false,
    sortOrder: 46,
  },

  // ---------- Sports ----------
  {
    slug: "retro-bowl",
    title: "Retro Bowl",
    description:
      "The viral retro American football manager. Draft your roster, call the plays and win the Retro Bowl.",
    category: "Sports",
    embedUrl: "https://retrobowl.me",
    thumbUrl: "https://retrobowl.me/api/og?title=Retro+Bowl",
    emoji: "🏈",
    featured: true,
    sortOrder: 47,
  },

  // ---------- Puzzle ----------
  {
    slug: "master-chess",
    title: "Master Chess",
    description:
      "Classic chess vs the computer or a friend in 2-player mode. Clean board, smart AI.",
    category: "Puzzle",
    embedUrl: UBG + "master-chess/",
    thumbUrl: null,
    emoji: "♟️",
    featured: false,
    sortOrder: 48,
  },
  {
    slug: "2048",
    title: "2048",
    description:
      "The open-source tile-merging phenomenon. Slide tiles, combine numbers and chase the 2048 tile.",
    category: "Puzzle",
    embedUrl: UBG + "2048/play.html",
    thumbUrl: "https://gabrielecirulli.github.io/2048/meta/og_image.png",
    emoji: "🔢",
    featured: false,
    sortOrder: 49,
  },
  {
    slug: "tetris",
    title: "Tetris",
    description:
      "Open-source React Tetris with hold, ghost pieces and hard drops. Stack clean or die.",
    category: "Puzzle",
    embedUrl: "https://chvin.github.io/react-tetris/",
    thumbUrl: null,
    emoji: "🟦",
    featured: false,
    sortOrder: 50,
  },
  {
    slug: "tower",
    title: "Tower",
    description:
      "Stack moving blocks into the sky with perfect timing. Open-source and endlessly satisfying.",
    category: "Puzzle",
    embedUrl: "https://iamkun.github.io/tower_game/",
    thumbUrl: null,
    emoji: "🏗️",
    featured: false,
    sortOrder: 51,
  },

  // ---------- Casual / Idle ----------
  {
    slug: "wordle",
    title: "Wordle",
    description:
      "hello wordl — the open-source daily word puzzle. Six guesses, one word, endless frustration.",
    category: "Casual",
    embedUrl: "https://hellowordl.net",
    thumbUrl: null,
    emoji: "🔤",
    featured: false,
    sortOrder: 52,
  },
  {
    slug: "cookie-clicker",
    title: "Cookie Clicker",
    description:
      "The original idle legend by Orteil. Click a cookie, buy grandmas, ascend and repeat forever.",
    category: "Idle",
    embedUrl: "https://orteil.dashnet.org/cookieclicker/",
    thumbUrl: null,
    emoji: "🍪",
    featured: false,
    sortOrder: 53,
  },
  {
    slug: "tiny-fishing",
    title: "Tiny Fishing",
    description:
      "Cast, hook and upgrade your way to legendary catches. Deeper water, weirder fish, bigger money.",
    category: "Casual",
    embedUrl: UBG + "tiny-fishing/",
    thumbUrl: null,
    emoji: "🎣",
    featured: false,
    sortOrder: 54,
  },
]

export const CATEGORIES = [
  "All",
  "FPS",
  "Battle Royale",
  "io",
  "Sandbox",
  "Racing",
  "2 Player",
  "Platformer",
  "Arcade",
  "Sports",
  "Strategy",
  "Puzzle",
  "Casual",
  "Idle",
]
