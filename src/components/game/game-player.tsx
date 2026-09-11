"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Maximize, Minimize, Star, Flag } from "lucide-react"
import { toast } from "sonner"
import type { Game, SessionUser } from "@/lib/types"
import { formatPlays } from "@/lib/types"
import { useSettings } from "@/stores/settings"
import { cn } from "@/lib/utils"

type Props = {
  game: Game
  related: Game[]
  user: SessionUser | null
  isFavorite: boolean
  onBack: () => void
  onOpenGame: (slug: string) => void
  onToggleFavorite: (game: Game) => void
  onSuggestFix: (game: Game) => void
}

const HEARTBEAT_MS = 15_000

export function GamePlayer({ game, related, user, isFavorite, onBack, onOpenGame, onToggleFavorite, onSuggestFix }: Props) {
  const { liquidGlass } = useSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [started, setStarted] = useState(false)

  // Track fullscreen state
  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => toast.error("Fullscreen was blocked by the browser"))
    }
  }, [])

  // Reset when switching games is handled by keying this component on game.id in the parent.
  // Count play + start on mount
  useEffect(() => {
    fetch(`/api/games/${game.id}/play`, { method: "POST" }).catch(() => {})
  }, [game.id])

  // Playtime heartbeat — only while playing, tab visible, and iframe intersecting
  useEffect(() => {
    if (!started) return
    const tick = () => {
      if (document.visibilityState !== "visible") return
      const iframe = containerRef.current?.querySelector("iframe")
      if (!iframe) return
      setSessionSeconds((s) => {
        const next = s + HEARTBEAT_MS / 1000
        if (user?.role === "user") {
          fetch("/api/playtime", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId: game.id, seconds: HEARTBEAT_MS / 1000 }),
          }).catch(() => {})
        }
        return next
      })
    }
    const id = setInterval(tick, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [started, game.id, user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6"
    >
      {/* Top bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={onBack}
          className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{game.title}</h1>
        </div>
        <span className="glass-chip hidden rounded-full px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex">
          {game.category} · {formatPlays(game.plays)} plays
        </span>
        {user?.role === "user" && (
          <button
            onClick={() => onToggleFavorite(game)}
            className={cn(
              "glass flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors hover:bg-white/10",
              isFavorite ? "text-amber-300" : "text-foreground"
            )}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            {isFavorite ? "Saved" : "Save"}
          </button>
        )}
        <a
          href={game.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
          title="Open the game in a new tab if it doesn't load here"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">New tab</span>
        </a>
        <button
          onClick={toggleFullscreen}
          className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
        >
          {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="hidden sm:inline">{fullscreen ? "Exit" : "Fullscreen"}</span>
        </button>
      </div>

      {/* Game frame */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-black",
          fullscreen ? "flex items-center justify-center" : liquidGlass ? "glass" : "border border-white/10"
        )}
      >
        <div className={cn("relative w-full", fullscreen ? "h-screen" : "aspect-video")}>
          {started ? (
            <iframe
              src={game.embedUrl}
              title={game.title}
              name="gameframe"
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; gamepad; pointer-lock; clipboard-write; encrypted-media; microphone; camera"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/80">
              {game.thumbUrl ? (
                      <img src={game.thumbUrl} alt="" className="max-h-28 rounded-xl object-cover shadow-2xl" />
              ) : (
                <span className="text-5xl">{game.emoji}</span>
              )}
              <div className="px-6 text-center">
                <h2 className="text-lg font-semibold text-foreground">Ready to play {game.title}?</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{game.description}</p>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
              >
                ▶ Play now
              </button>
              <p className="text-xs text-muted-foreground">
                {user?.role === "user" ? "Signed in — your playtime is being tracked" : "Log in to track your playtime"}
              </p>
            </div>
          )}
        </div>
        {started && (
          <div className="pointer-events-none absolute bottom-2 right-3 select-none rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md">
            {Math.floor(sessionSeconds / 60)}m this session
            {fullscreen ? "" : " · some games need a click inside first"}
          </div>
        )}
      </div>

      {/* Broken game report + description */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="glass flex-1 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground">About this game</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{game.description}</p>
          <button
            onClick={() => onSuggestFix(game)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Flag className="h-3.5 w-3.5" />
            Game not loading? Report it
          </button>
        </div>
        {related.length > 0 && (
          <div className="glass w-full rounded-2xl p-4 sm:w-72">
            <h3 className="mb-2 text-sm font-semibold text-foreground">More {game.category}</h3>
            <div className="flex max-h-44 flex-col gap-1 overflow-y-auto">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onOpenGame(r.slug)}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{r.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{formatPlays(r.plays)} plays</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
