"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Save, Star, Trophy, X } from "lucide-react"
import { toast } from "sonner"
import type { Game, SessionUser, PlaytimeEntry } from "@/lib/types"
import { formatDuration } from "@/lib/types"
import { GameCard } from "@/components/game/game-card"

const AVATAR_EMOJIS = ["🎮", "🚀", "🐉", "👾", "🔥", "⚡", "🌟", "🦊", "🐸", "🦄", "🐺", "🎯", "🍕", "👻", "🤖", "👑"]
const AVATAR_COLORS = ["#f97316", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#14b8a6", "#6366f1"]

type ProfileData = {
  bio: string
  avatarEmoji: string
  avatarColor: string
  avatarUrl: string
}

type Props = {
  user: SessionUser
  favorites: Game[]
  playtime: PlaytimeEntry[]
  games: Game[]
  onClose: () => void
  onOpenGame: (slug: string) => void
  onToggleFavorite: (game: Game) => void
  onProfileUpdated: () => void
}

export function ProfileView({ user, favorites, playtime, games, onClose, onOpenGame, onToggleFavorite, onProfileUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<ProfileData>({
    bio: user.bio || "",
    avatarEmoji: user.avatarEmoji || "🎮",
    avatarColor: user.avatarColor || "#f97316",
    avatarUrl: user.avatarUrl || "",
  })

  const totalSeconds = playtime.reduce((sum, p) => sum + p.seconds, 0)
  const playtimeMap = new Map(playtime.map((p) => [p.gameId, p.seconds]))
  const topGames = [...playtime]
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 5)
    .map((p) => ({ game: games.find((g) => g.id === p.gameId), seconds: p.seconds }))
    .filter((x) => x.game)

  async function saveProfile() {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to save")
        return
      }
      toast.success("Profile saved")
      setEditing(false)
      onProfileUpdated()
    } catch {
      toast.error("Network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6"
    >
      {/* Header card */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl text-4xl shadow-lg"
            style={{ backgroundColor: draft.avatarColor + "33", border: `1px solid ${draft.avatarColor}55` }}
          >
            {draft.avatarUrl ? (
                  <img src={draft.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              draft.avatarEmoji
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-foreground">{user.username}</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {editing ? "Editing profile…" : draft.bio || "No bio yet — click Edit profile to add one."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="glass-chip flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {formatDuration(totalSeconds)} played
              </span>
              <span className="glass-chip flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                {favorites.length} favorites
              </span>
              <span className="glass-chip flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                {games.length ? "Player" : "Newbie"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={saveProfile} disabled={busy} className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)} className="rounded-full">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} variant="outline" className="rounded-full font-semibold">
                Edit profile
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" className="rounded-full" aria-label="Close profile">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex flex-col gap-4 border-t border-border/60 pt-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</label>
              <Textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="Tell the arcade who you are…"
                maxLength={300}
                className="min-h-[70px] rounded-xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setDraft({ ...draft, avatarEmoji: e, avatarUrl: "" })}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all hover:scale-110 ${
                      draft.avatarEmoji === e && !draft.avatarUrl ? "bg-primary/20 ring-2 ring-primary" : "glass-chip"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, avatarColor: c })}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      draft.avatarColor === c ? "ring-2 ring-white/70 ring-offset-2 ring-offset-background" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <div className="mt-3">
                <Input
                  value={draft.avatarUrl}
                  onChange={(e) => setDraft({ ...draft, avatarUrl: e.target.value })}
                  placeholder="Or paste an image URL (https://…)"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top games */}
      {topGames.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Most played</h2>
          <div className="glass rounded-3xl p-4">
            {topGames.map(({ game, seconds }, i) => (
              <button
                key={game!.id}
                onClick={() => onOpenGame(game!.slug)}
                className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                <span className="text-2xl">{game!.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{game!.title}</span>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(6, (seconds / topGames[0].seconds) * 100)}%` }}
                    />
                  </div>
                </span>
                <span className="text-xs font-medium text-muted-foreground">{formatDuration(seconds)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Favorites <span className="text-sm font-normal text-muted-foreground">({favorites.length})</span>
        </h2>
        {favorites.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <Star className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 font-medium text-foreground">No favorites yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Hit the ★ on any game to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {favorites.map((g, i) => (
              <GameCard key={g.id} game={g} isFavorite index={i} onOpen={onOpenGame} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        )}
      </section>

      {/* All playtime */}
      {playtimeMap.size > 0 && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Playtime is tracked automatically while you play with the tab visible.
        </p>
      )}
    </motion.div>
  )
}
