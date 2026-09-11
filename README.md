# 🎮 PlayVault — Unblocked Games Arcade

A full-featured unblocked games site with **54 verified real games** (no fake/Scratch clones), user accounts, favorites, playtime tracking, and an admin panel — wrapped in an Apple-style **Liquid Glass** dark UI you can toggle off in Settings.

![Games](https://eaglercraft.com/steve.png)

## What's inside

- **54 real games** — every embed URL tested for iframe compatibility (Eaglercraft 1.12.2 wasmGC + 1.8, Krunker, Zombs Royale, BuildRoyale, Voxiom.io, PolyTrack, Smash Karts, Shell Shockers, Super Mario 64, Friday Night Funkin', Retro Bowl, Vex 5, Run 3, and 40+ more)
- **User accounts** — register/login, avatar (emoji + color or image URL), bio, favorites, automatic playtime tracking
- **Admin panel** — login-only (no registration) with add/edit/delete games, approve/reject suggestions, play stats
- **Suggestion system** — anyone can suggest games or report broken ones; admins review in the panel
- **Liquid Glass UI** — frosted translucent panels with a Settings toggle to switch to solid dark mode (better performance on old devices)
- **Search + categories + featured section** — find anything instantly
- **Fullscreen player** with per-session playtime and "open in new tab" fallback for stubborn games

## Quick start (local)

```bash
bun install        # or: npm install
cp .env.example .env
bun run db:push    # creates the local SQLite database
bun run dev        # http://localhost:3000
```

The 54-game catalog seeds itself on first launch.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes (local mode) | SQLite path, e.g. `file:./db/custom.db` |
| `AUTH_SECRET` | yes in prod | Random string used to sign session JWTs |
| `ADMIN_USERNAME` | yes | Admin login username |
| `ADMIN_PASSWORD` | yes | Admin login password — **wrap in quotes** if it contains `#` |
| `SUPABASE_URL` | no | Your Supabase project URL (enables cloud mode) |
| `SUPABASE_ANON_KEY` | no | Your Supabase anon key |

**Important:** values containing `#` must be quoted in `.env` — e.g. `ADMIN_PASSWORD="!0#%^%f59M7@#1&3!087"` — or everything after `#` is treated as a comment.

## Switching to Supabase (cloud persistence)

Local mode uses SQLite (perfect for development). For production (Vercel), data won't survive on SQLite — use your free Supabase project:

1. Open your Supabase dashboard → **SQL Editor** → paste the entire **`supabase-setup.sql`** file → **Run**
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your environment (Vercel → Settings → Environment Variables)
3. Deploy. On first load the app detects Supabase, seeds the game catalog, and all users/favorites/playtime persist in the cloud.

The app automatically falls back to SQLite if Supabase is unreachable, so it never breaks.

## Deploying to Vercel (free)

1. Push this repo to GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo
3. Add the environment variables above (including Supabase ones)
4. Deploy — done. Your game site is live on a `*.vercel.app` domain.

> Note: set `DATABASE_URL` to any placeholder (e.g. `file:./db/custom.db`) even in Supabase mode — Prisma needs it at build time.

## Admin login

The admin account is defined by env vars (no registration):

```
Username: admin
Password: (your ADMIN_PASSWORD value)
```

Find the admin panel via the 🛡️ shield icon in the top bar.

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- shadcn/ui + Framer Motion + Zustand
- Prisma ORM (SQLite locally)
- Supabase JS (cloud persistence when configured)
- Custom JWT session auth (jose + bcryptjs) — no third-party auth dependency

## When a game breaks

Game mirrors rotate — that's the nature of unblocked-games sites. PlayVault is built for it:

- **Users:** hit "Report" on any game page → the report lands in the admin queue
- **Admins:** open the game in the admin panel → paste a new embed URL → save. 10-second fix.
- Every game also has an **Open in new tab** button as an instant fallback.

## License & content

PlayVault embeds games from their official sources and public mirrors and hosts no game files itself. All game trademarks belong to their respective owners. The original 2048, Flappy Bird remake, React Tetris, and Tower are open-source projects.
