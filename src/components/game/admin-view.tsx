"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, KeyRound, LogOut, Pencil, Plus, Shield, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { Game, Suggestion } from "@/lib/types"
import { CATEGORIES } from "@/lib/games-seed"
import { formatPlays } from "@/lib/types"

type Props = {
  isAdmin: boolean
  suggestions: Suggestion[]
  games: Game[]
  onAdminLogin: (username: string, password: string) => Promise<boolean>
  onLogout: () => void
  onRefresh: () => void
  onClose: () => void
  onOpenGame: (slug: string) => void
}

type EditDraft = {
  id?: string
  title: string
  embedUrl: string
  description: string
  category: string
  emoji: string
  thumbUrl: string
  featured: boolean
}

const EMPTY_DRAFT: EditDraft = {
  title: "",
  embedUrl: "",
  description: "",
  category: "Arcade",
  emoji: "🎮",
  thumbUrl: "",
  featured: false,
}

export function AdminView({ isAdmin, suggestions, games, onAdminLogin, onLogout, onRefresh, onClose, onOpenGame }: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState<EditDraft>(EMPTY_DRAFT)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = await onAdminLogin(username, password)
    setBusy(false)
    if (ok) {
      setUsername("")
      setPassword("")
    }
  }

  async function api(path: string, method: string, body?: unknown) {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || "Request failed")
      return null
    }
    return data
  }

  async function saveGame(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const payload = {
      title: draft.title,
      embedUrl: draft.embedUrl,
      description: draft.description,
      category: draft.category,
      emoji: draft.emoji,
      thumbUrl: draft.thumbUrl || null,
      featured: draft.featured,
    }
    const result = draft.id ? await api(`/api/games/${draft.id}`, "PATCH", payload) : await api("/api/games", "POST", payload)
    setBusy(false)
    if (result) {
      toast.success(draft.id ? "Game updated" : "Game added")
      setEditOpen(false)
      onRefresh()
    }
  }

  async function deleteGame(game: Game) {
    if (!confirm(`Delete "${game.title}"? This can't be undone.`)) return
    if (await api(`/api/games/${game.id}`, "DELETE")) {
      toast.success("Game deleted")
      onRefresh()
    }
  }

  async function handleSuggestion(s: Suggestion, status: "approved" | "rejected") {
    if (status === "approved") {
      // approve + prefill the add-game form
      if (await api(`/api/suggestions/${s.id}`, "PATCH", { status })) {
        setDraft({ ...EMPTY_DRAFT, title: s.gameTitle, embedUrl: s.url || "", description: s.note })
        setEditOpen(true)
        toast.success("Marked approved — finish adding the game")
      }
    } else {
      if (await api(`/api/suggestions/${s.id}`, "PATCH", { status })) {
        toast.success("Rejected")
      }
    }
    onRefresh()
  }

  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto w-full max-w-sm px-4 pt-24">
        <div className="glass-strong rounded-3xl p-8">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-center text-xl font-bold">Admin login</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Manage games and suggestions</p>
          <form onSubmit={login} className="mt-6 flex flex-col gap-3">
            <Input placeholder="Admin username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            <Button type="submit" disabled={busy} className="rounded-full bg-primary font-semibold text-primary-foreground">
              <KeyRound className="mr-2 h-4 w-4" />
              {busy ? "Checking…" : "Sign in"}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  const pending = suggestions.filter((s) => s.status === "pending")
  const decided = suggestions.filter((s) => s.status !== "pending")

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-6 w-6 text-primary" /> Admin panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {games.length} games · {pending.length} pending suggestions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDraft(EMPTY_DRAFT)
              setEditOpen(true)
            }}
            className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add game
          </Button>
          <Button onClick={onLogout} variant="outline" className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
          <Button onClick={onClose} variant="ghost" className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pending suggestions */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Suggestions</h2>
        {suggestions.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">No suggestions yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...pending, ...decided].map((s) => (
              <div key={s.id} className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{s.gameTitle}</p>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-primary hover:underline">
                      {s.url}
                    </a>
                  )}
                  {s.note && <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>}
                </div>
                {s.status !== "pending" ? (
                  <Badge variant={s.status === "approved" ? "default" : "secondary"}>{s.status}</Badge>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSuggestion(s, "approved")} className="rounded-full bg-emerald-600 font-medium hover:bg-emerald-600/90">
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve & add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSuggestion(s, "rejected")} className="rounded-full">
                      <X className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Games table */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Games</h2>
        <div className="glass overflow-hidden rounded-3xl">
          <div className="max-h-[480px] overflow-y-auto">
            {games.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0 hover:bg-white/[0.03]">
                <span className="text-xl">{g.emoji}</span>
                <button onClick={() => onOpenGame(g.slug)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-foreground">{g.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{g.category} · {formatPlays(g.plays)} plays{g.featured ? " · 🔥 featured" : ""}</p>
                </button>
                <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground lg:block">{g.embedUrl}</span>
                <div className="flex gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setDraft({
                        id: g.id,
                        title: g.title,
                        embedUrl: g.embedUrl,
                        description: g.description,
                        category: g.category,
                        emoji: g.emoji,
                        thumbUrl: g.thumbUrl || "",
                        featured: g.featured,
                      })
                      setEditOpen(true)
                    }}
                    aria-label={`Edit ${g.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive" onClick={() => deleteGame(g)} aria-label={`Delete ${g.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edit / add dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => setEditOpen(o)}>
        <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? `Edit ${draft.title}` : "Add a game"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveGame} className="flex flex-col gap-3">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Emoji</label>
                <Input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} maxLength={4} className="rounded-xl text-center text-xl" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Title</label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required maxLength={80} className="rounded-xl" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Embed URL (iframe src)</label>
              <Input value={draft.embedUrl} onChange={(e) => setDraft({ ...draft, embedUrl: e.target.value })} required type="url" placeholder="https://…" className="rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Thumbnail URL (optional)</label>
              <Input value={draft.thumbUrl} onChange={(e) => setDraft({ ...draft, thumbUrl: e.target.value })} type="url" placeholder="https://…" className="rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={300} className="min-h-[70px] rounded-xl" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                className="h-4 w-4 accent-[#f97316]"
              />
              Feature on the hero carousel
            </label>
            <Button type="submit" disabled={busy} className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
              {busy ? "Saving…" : draft.id ? "Save changes" : "Add game"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
