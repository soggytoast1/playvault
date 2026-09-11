"use client"

import { motion } from "framer-motion"
import { Play, Star } from "lucide-react"
import type { Game } from "@/lib/types"
import { formatPlays } from "@/lib/types"
import { useSettings } from "@/stores/settings"
import { cn } from "@/lib/utils"

const CATEGORY_TINTS: Record<string, string> = {
  FPS: "bg-orange-500/10",
  "Battle Royale": "bg-red-500/10",
  io: "bg-teal-500/10",
  Sandbox: "bg-emerald-500/10",
  Racing: "bg-yellow-500/10",
  "2 Player": "bg-pink-500/10",
  Platformer: "bg-violet-500/10",
  Arcade: "bg-fuchsia-500/10",
  Sports: "bg-lime-500/10",
  Strategy: "bg-cyan-500/10",
  Puzzle: "bg-sky-500/10",
  Casual: "bg-amber-500/10",
  Idle: "bg-rose-500/10",
}

type Props = {
  game: Game
  isFavorite?: boolean
  index?: number
  onOpen: (slug: string) => void
  onToggleFavorite?: (game: Game) => void
}

export function GameCard({ game, isFavorite, index = 0, onOpen, onToggleFavorite }: Props) {
  const { compactCards, showPlays } = useSettings()

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(game.slug)}
      className={cn(
        "game-card glass group relative flex w-full flex-col overflow-hidden rounded-2xl text-left",
        compactCards ? "p-2" : "p-3"
      )}
      aria-label={`Play ${game.title}`}
    >
      <div className="sheen relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900">
        {/* emoji poster (base layer, always present) */}
        <div
          className={cn("absolute inset-0 flex items-center justify-center", CATEGORY_TINTS[game.category] ?? "")}
          aria-hidden
        >
          <span className={cn("select-none opacity-90 drop-shadow-lg", compactCards ? "text-3xl" : "text-5xl")}>
            {game.emoji}
          </span>
        </div>

        {/* real thumbnail overlays the poster when it loads */}
        {game.thumbUrl ? (
          <img
            src={game.thumbUrl}
            alt={game.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : null}

        {/* hover play badge */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="h-5 w-5 translate-x-[1px] fill-current" />
          </span>
        </div>

        {game.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
            Hot
          </span>
        )}
        {isFavorite && onToggleFavorite && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(game)
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-amber-300 backdrop-blur-md transition-transform hover:scale-110"
            aria-label="Remove from favorites"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 px-1 pt-2.5">
        <div className="min-w-0">
          <h3 className={cn("truncate font-semibold text-foreground", compactCards ? "text-sm" : "text-[15px]")}>
            {game.title}
          </h3>
          {!compactCards && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{game.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pb-1 pt-1.5">
        <span className="glass-chip rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {game.category}
        </span>
        {showPlays && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Play className="h-3 w-3 fill-current" />
            {formatPlays(game.plays)}
          </span>
        )}
      </div>
    </motion.button>
  )
}
