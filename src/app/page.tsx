"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Search, Settings2, Sparkles, User as UserIcon, Shield, LogOut, Lightbulb, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GameCard } from "@/components/game/game-card"
import { GamePlayer } from "@/components/game/game-player"
import { AuthModal } from "@/components/game/auth-modal"
import { SuggestModal } from "@/components/game/suggest-modal"
import { SettingsSheet } from "@/components/game/settings-sheet"
import { ProfileView } from "@/components/game/profile-view"
import { AdminView } from "@/components/game/admin-view"
import { useSettings, applySettingClasses } from "@/stores/settings"
import { CATEGORIES } from "@/lib/games-seed"
import type { Game, SessionUser, Suggestion, PlaytimeEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

type Route = { view: "home" } | { view: "game"; slug: string } | { view: "profile" } | { view: "admin" }

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "")
  if (h.startsWith("game/")) return { view: "game", slug: h.slice(5) }
  if (h === "profile") return { view: "profile" }
  if (h === "admin") return { view: "admin" }
  return { view: "home" }
}

export default function Home() {
  const [route, setRoute] = useState<Route>({ view: "home" })
  const [games, setGames] = useState<Game[]>([])
  const [user, setUser] = useState<SessionUser | null>(null)
  const [favorites, setFavorites] = useState<Game[]>([])
  const [playtime, setPlaytime] = useState<PlaytimeEntry[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [mode, setMode] = useState<string>("local")
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestPreset, setSuggestPreset] = useState<{ title: string; url: string; fix: boolean }>({ title: "", url: "", fix: false })

  const settings = useSettings()
  useEffect(() => applySettingClasses(settings), [settings])

  // ---- routing ----
  useEffect(() => {
    const handler = () => setRoute(parseHash())
    window.addEventListener("hashchange", handler)
    setRoute(parseHash())
    return () => window.removeEventListener("hashchange", handler)
  }, [])

  const navigate = useCallback((r: Route) => {
    if (r.view === "home") window.location.hash = ""
    else if (r.view === "game") window.location.hash = `/game/${r.slug}`
    else window.location.hash = `/${r.view}`
    window.scrollTo({ top: 0 })
  }, [])

  // ---- data ----
  const refreshUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user ?? null)
      setFavorites(data.favorites ?? [])
      setPlaytime(data.playtime ?? [])
    } catch {
      /* offline */
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/bootstrap")
        const data = await res.json()
        setGames(data.games ?? [])
        setUser(data.user ?? null)
        setMode(data.mode ?? "local")
      } catch {
        toast.error("Couldn't load the game library")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refreshSuggestions = useCallback(async () => {
    if (user?.role !== "admin") {
      setSuggestions([])
      return
    }
    try {
      const res = await fetch("/api/suggestions")
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
      }
    } catch {
      /* ignore */
    }
  }, [user])

  useEffect(() => {
    refreshSuggestions()
  }, [refreshSuggestions])

  // Refetch suggestions every time the admin panel is opened
  useEffect(() => {
    if (route.view === "admin" && user?.role === "admin") {
      refreshSuggestions()
    }
  }, [route.view, user?.role, refreshSuggestions])

  const refreshAll = useCallback(async () => {
    const res = await fetch("/api/bootstrap")
    const data = await res.json()
    setGames(data.games ?? [])
    await refreshUserData()
  }, [refreshUserData])

  // ---- favorites ----
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites])

  const toggleFavorite = useCallback(
    async (game: Game) => {
      if (!user || user.role !== "user") {
        setAuthOpen(true)
        return
      }
      setFavorites((prev) => (prev.some((f) => f.id === game.id) ? prev.filter((f) => f.id !== game.id) : [...prev, game]))
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id }),
        })
        if (!res.ok) throw new Error()
      } catch {
        setFavorites((prev) => (prev.some((f) => f.id === game.id) ? prev.filter((f) => f.id !== game.id) : [...prev, game]))
        toast.error("Couldn't save favorite")
      }
    },
    [user]
  )

  // ---- filtering ----
  const filtered = useMemo(() => {
    let list = games
    if (category !== "All") list = list.filter((g) => g.category === category)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [games, category, query])

  const featured = useMemo(() => games.filter((g) => g.featured).slice(0, 8), [games])
  const currentGame = route.view === "game" ? games.find((g) => g.slug === route.slug) : undefined
  const related = useMemo(() => {
    if (!currentGame) return []
    return games.filter((g) => g.category === currentGame.category && g.id !== currentGame.id).slice(0, 6)
  }, [currentGame, games])

  // ---- auth ----
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
    setUser(null)
    setFavorites([])
    setPlaytime([])
    setSuggestions([])
    toast.success("Logged out")
    navigate({ view: "home" })
  }

  const doAdminLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) return false
    setUser({ id: "admin", username: "admin", role: "admin", avatarEmoji: "🛡️" })
    toast.success("Welcome, admin")
    return true
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ambient wallpaper (hidden when glass is off) */}
      <div className="ambient" aria-hidden />

      {/* ---------------- Nav ---------------- */}
      <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4">
        <nav className="glass-strong mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full px-3 pr-2">
          <button onClick={() => navigate({ view: "home" })} className="flex items-center gap-2 pl-1 pr-2" aria-label="PlayVault home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="hidden text-lg font-black tracking-tight text-foreground sm:block">
              Play<span className="text-primary">Vault</span>
            </span>
          </button>

          {/* search */}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (route.view !== "home") navigate({ view: "home" })
              }}
              placeholder={`Search ${games.length || ""} games…`}
              className="h-9 rounded-full border-white/10 bg-white/5 pl-9 text-sm placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {user?.role === "user" && (
              <button
                onClick={() => navigate({ view: "profile" })}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                aria-label="Your profile"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm">{user.avatarEmoji || "🎮"}</span>
              </button>
            )}
            <button
              onClick={() => navigate({ view: "admin" })}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Admin"
            >
              <Shield className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setSuggestPreset({ title: "", url: "", fix: false })
                setSuggestOpen(true)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Suggest a game"
            >
              <Lightbulb className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            {user ? (
              <button
                onClick={logout}
                className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ---------------- Main ---------------- */}
      <main className="relative z-10 flex-1">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/15 text-2xl">🎮</div>
            <p className="text-sm text-muted-foreground">Loading the vault…</p>
          </div>
        ) : route.view === "game" && currentGame ? (
          <GamePlayer
            key={currentGame.id}
            game={currentGame}
            related={related}
            user={user}
            isFavorite={favoriteIds.has(currentGame.id)}
            onBack={() => navigate({ view: "home" })}
            onOpenGame={(slug) => navigate({ view: "game", slug })}
            onToggleFavorite={toggleFavorite}
            onSuggestFix={(g) => {
              setSuggestPreset({ title: g.title, url: g.embedUrl, fix: true })
              setSuggestOpen(true)
            }}
          />
        ) : route.view === "game" ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="text-5xl">🔍</span>
            <h1 className="text-xl font-bold">Game not found</h1>
            <p className="text-sm text-muted-foreground">It may have been removed or the link is wrong.</p>
            <Button onClick={() => navigate({ view: "home" })} className="rounded-full bg-primary text-primary-foreground">
              Back to all games
            </Button>
          </div>
        ) : route.view === "profile" ? (
          user?.role === "user" ? (
            <ProfileView
              user={user}
              favorites={favorites}
              playtime={playtime}
              games={games}
              onClose={() => navigate({ view: "home" })}
              onOpenGame={(slug) => navigate({ view: "game", slug })}
              onToggleFavorite={toggleFavorite}
              onProfileUpdated={refreshAll}
            />
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
              <span className="text-5xl">👤</span>
              <h1 className="text-xl font-bold">You&apos;re not signed in</h1>
              <p className="max-w-sm text-sm text-muted-foreground">Sign in to see your favorites and tracked playtime.</p>
              <Button onClick={() => setAuthOpen(true)} className="rounded-full bg-primary text-primary-foreground">
                Sign in / Register
              </Button>
            </div>
          )
        ) : route.view === "admin" ? (
          <AdminView
            isAdmin={user?.role === "admin"}
            suggestions={suggestions}
            games={games}
            onAdminLogin={doAdminLogin}
            onLogout={logout}
            onRefresh={async () => {
              await refreshAll()
              await refreshSuggestions()
            }}
            onClose={() => navigate({ view: "home" })}
            onOpenGame={(slug) => navigate({ view: "game", slug })}
          />
        ) : (
          <HomeView
            games={games}
            filtered={filtered}
            featured={featured}
            favorites={favoriteIds}
            query={query}
            category={category}
            onCategory={setCategory}
            onOpen={(slug) => navigate({ view: "game", slug })}
            onToggleFavorite={toggleFavorite}
            mode={mode}
          />
        )}
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative z-10 mt-8 border-t border-border/40 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            PlayVault · {games.length} games · storage: {mode === "supabase" ? "Supabase cloud" : "local database"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            Games are embedded from their official sources. Play responsibly.
          </p>
        </div>
      </footer>

      {/* ---------------- Modals ---------------- */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoggedIn={async (u) => {
          await refreshAll()
          if (u.role === "user") navigate({ view: "profile" })
        }}
      />
      <SuggestModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        presetTitle={suggestPreset.title}
        presetUrl={suggestPreset.url}
        fixMode={suggestPreset.fix}
      />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

/* -------- Home view -------- */

function HomeView({
  games,
  filtered,
  featured,
  favorites,
  query,
  category,
  onCategory,
  onOpen,
  onToggleFavorite,
  mode,
}: {
  games: Game[]
  filtered: Game[]
  featured: Game[]
  favorites: Set<string>
  query: string
  category: string
  onCategory: (c: string) => void
  onOpen: (slug: string) => void
  onToggleFavorite: (game: Game) => void
  mode: string
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* Hero */}
      <section className="mb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-5xl"
        >
          {games.length}+ games.
          <br />
          <span className="text-primary">Zero limits.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          The unblocked arcade — real games, instant play, no downloads.{" "}
          {mode === "supabase" ? "Cloud-synced" : "Fully self-hosted"} with accounts, favorites and playtime tracking.
        </motion.p>
      </section>

      {/* Featured strip */}
      {!query && category === "All" && featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-foreground">🔥 Trending now</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((g, i) => (
              <GameCard key={g.id} game={g} index={i} onOpen={onOpen} isFavorite={favorites.has(g.id)} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm",
              category === c ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "glass-chip text-muted-foreground hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </section>

      {/* Grid */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {query ? `Results for "${query}"` : category === "All" ? "All games" : category}
            <span className="ml-2 text-sm font-normal text-muted-foreground">{filtered.length}</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <span className="text-4xl">🕵️</span>
            <p className="mt-3 font-semibold text-foreground">Nothing found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another search or category — or suggest a game!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filtered.map((g, i) => (
              <GameCard key={g.id} game={g} index={i} onOpen={onOpen} isFavorite={favorites.has(g.id)} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
