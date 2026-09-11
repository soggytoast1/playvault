export type Game = {
  id: string
  slug: string
  title: string
  description: string
  category: string
  embedUrl: string
  thumbUrl: string | null
  emoji: string
  featured: boolean
  plays: number
  sortOrder: number
  active: boolean
  createdAt: string
}

export type SessionUser = {
  id: string
  username: string
  role: "user" | "admin"
  avatarEmoji?: string
  avatarColor?: string
}

export type Suggestion = {
  id: string
  gameTitle: string
  url: string
  note: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export type PlaytimeEntry = {
  gameId: string
  seconds: number
}

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
  return String(n)
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${totalSeconds}s`
}
