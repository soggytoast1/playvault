import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { db } from "@/lib/db"
import { SEED_GAMES } from "@/lib/games-seed"

export type GameRow = {
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

export type SuggestionRow = {
  id: string
  gameTitle: string
  url: string
  note: string
  status: string
  createdAt: string
}

export type UserRow = {
  id: string
  username: string
  passwordHash: string
  bio: string
  avatarEmoji: string
  avatarColor: string
  avatarUrl: string | null
  createdAt: string
}

export type PlaytimeRow = {
  gameId: string
  seconds: number
}

let supabase: SupabaseClient | null = null
let modeCache: "supabase" | "local" | null = null
let modeCheckedAt = 0

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return supabase
}

/** Decide which backend to use. Supabase wins when configured AND reachable. */
export async function getMode(): Promise<"supabase" | "local"> {
  if (modeCache && Date.now() - modeCheckedAt < 60_000) return modeCache
  const sb = getSupabase()
  if (!sb) {
    modeCache = "local"
  } else {
    try {
      const { error } = await sb.from("games").select("id").limit(1)
      modeCache = error ? "local" : "supabase"
    } catch {
      modeCache = "local"
    }
  }
  modeCheckedAt = Date.now()
  return modeCache
}

const sb = () => getSupabase()!

function iso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString()
}

// ---------------------------- Games ----------------------------

export async function listGames(): Promise<GameRow[]> {
  if ((await getMode()) === "supabase") {
    const { data, error } = await sb().from("games").select("*").eq("active", true)
    if (error) throw new Error(error.message)
    return (data as GameRow[]).sort((a, b) => a.sortOrder - b.sortOrder)
  }
  const games = await db.game.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } })
  return games.map((g) => ({ ...g, createdAt: iso(g.createdAt) }) as GameRow)
}

export async function getGameBySlug(slug: string): Promise<GameRow | null> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("games").select("*").eq("slug", slug).maybeSingle()
    return (data as GameRow) ?? null
  }
  const g = await db.game.findFirst({ where: { slug } })
  return g ? ({ ...g, createdAt: iso(g.createdAt) } as GameRow) : null
}

export async function getGameById(id: string): Promise<GameRow | null> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("games").select("*").eq("id", id).maybeSingle()
    return (data as GameRow) ?? null
  }
  const g = await db.game.findUnique({ where: { id } })
  return g ? ({ ...g, createdAt: iso(g.createdAt) } as GameRow) : null
}

export async function createGame(input: Partial<GameRow> & { slug: string; title: string; embedUrl: string }): Promise<GameRow> {
  if ((await getMode()) === "supabase") {
    const row = {
      slug: input.slug,
      title: input.title,
      description: input.description ?? "",
      category: input.category ?? "Arcade",
      embedUrl: input.embedUrl,
      thumbUrl: input.thumbUrl ?? null,
      emoji: input.emoji ?? "🎮",
      featured: input.featured ?? false,
      plays: 0,
      sortOrder: input.sortOrder ?? 100,
      active: true,
    }
    const { data, error } = await sb().from("games").insert(row).select().single()
    if (error) throw new Error(error.message)
    return data as GameRow
  }
  const g = await db.game.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description ?? "",
      category: input.category ?? "Arcade",
      embedUrl: input.embedUrl,
      thumbUrl: input.thumbUrl ?? null,
      emoji: input.emoji ?? "🎮",
      featured: input.featured ?? false,
      sortOrder: input.sortOrder ?? 100,
    },
  })
  return { ...g, createdAt: iso(g.createdAt) } as GameRow
}

export async function updateGame(id: string, patch: Partial<GameRow>): Promise<void> {
  if ((await getMode()) === "supabase") {
    const { error } = await sb().from("games").update(patch).eq("id", id)
    if (error) throw new Error(error.message)
    return
  }
  const data: Record<string, unknown> = { ...patch }
  delete data.createdAt
  delete data.id
  await db.game.update({ where: { id }, data })
}

export async function deleteGame(id: string): Promise<void> {
  if ((await getMode()) === "supabase") {
    await sb().from("games").delete().eq("id", id)
    return
  }
  await db.game.delete({ where: { id } })
}

export async function incrementPlays(gameId: string): Promise<void> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("games").select("plays").eq("id", gameId).single()
    const plays = (data?.plays ?? 0) + 1
    await sb().from("games").update({ plays }).eq("id", gameId)
    return
  }
  const g = await db.game.findUnique({ where: { id: gameId } })
  if (g) await db.game.update({ where: { id: gameId }, data: { plays: g.plays + 1 } })
}

/** Seed the launch catalog when the games table is empty. */
export async function ensureSeeded(): Promise<void> {
  if ((await getMode()) === "supabase") {
    const { count } = await sb().from("games").select("id", { count: "exact", head: true })
    if ((count ?? 0) > 0) return
    const rows = SEED_GAMES.map((g) => ({
      slug: g.slug,
      title: g.title,
      description: g.description,
      category: g.category,
      embedUrl: g.embedUrl,
      thumbUrl: g.thumbUrl,
      emoji: g.emoji,
      featured: g.featured,
      plays: 0,
      sortOrder: g.sortOrder,
      active: true,
    }))
    await sb().from("games").insert(rows)
    return
  }
  const count = await db.game.count()
  if (count > 0) return
  await db.game.createMany({ data: SEED_GAMES.map((g) => ({ ...g })) })
}

// ---------------------------- Suggestions ----------------------------

export async function listSuggestions(): Promise<SuggestionRow[]> {
  if ((await getMode()) === "supabase") {
    const { data, error } = await sb().from("suggestions").select("*").order("createdAt", { ascending: false })
    if (error) throw new Error(error.message)
    return data as SuggestionRow[]
  }
  const rows = await db.suggestion.findMany({ orderBy: { createdAt: "desc" } })
  return rows.map((s) => ({ ...s, createdAt: iso(s.createdAt) })) as SuggestionRow[]
}

export async function createSuggestion(input: { gameTitle: string; url?: string; note?: string }): Promise<SuggestionRow> {
  const row = {
    gameTitle: input.gameTitle.trim().slice(0, 120),
    url: (input.url || "").trim().slice(0, 500),
    note: (input.note || "").trim().slice(0, 500),
    status: "pending",
  }
  if ((await getMode()) === "supabase") {
    const { data, error } = await sb().from("suggestions").insert(row).select().single()
    if (error) throw new Error(error.message)
    return data as SuggestionRow
  }
  const s = await db.suggestion.create({ data: row })
  return { ...s, createdAt: iso(s.createdAt) } as SuggestionRow
}

export async function updateSuggestionStatus(id: string, status: string): Promise<void> {
  if ((await getMode()) === "supabase") {
    await sb().from("suggestions").update({ status }).eq("id", id)
    return
  }
  await db.suggestion.update({ where: { id }, data: { status } })
}

// ---------------------------- Users ----------------------------

function toUserRow(u: any): UserRow {
  return {
    id: u.id,
    username: u.username,
    passwordHash: u.passwordHash ?? "",
    bio: u.bio ?? "",
    avatarEmoji: u.avatarEmoji ?? "🎮",
    avatarColor: u.avatarColor ?? "#f97316",
    avatarUrl: u.avatarUrl ?? null,
    createdAt: iso(u.createdAt ?? new Date()),
  }
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("users").select("*").ilike("username", username).maybeSingle()
    return data ? toUserRow(data) : null
  }
  const u = await db.user.findFirst({ where: { username } })
  return u ? toUserRow(u) : null
}

export async function getUserById(id: string): Promise<UserRow | null> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("users").select("*").eq("id", id).maybeSingle()
    return data ? toUserRow(data) : null
  }
  const u = await db.user.findUnique({ where: { id } })
  return u ? toUserRow(u) : null
}

export async function countUsers(): Promise<number> {
  if ((await getMode()) === "supabase") {
    const { count } = await sb().from("users").select("id", { count: "exact", head: true })
    return count ?? 0
  }
  return db.user.count()
}

export async function createUser(input: {
  username: string
  passwordHash: string
  avatarEmoji?: string
  avatarColor?: string
}): Promise<UserRow> {
  if ((await getMode()) === "supabase") {
    const { data, error } = await sb()
      .from("users")
      .insert({
        username: input.username,
        passwordHash: input.passwordHash,
        bio: "",
        avatarEmoji: input.avatarEmoji ?? "🎮",
        avatarColor: input.avatarColor ?? "#f97316",
        avatarUrl: null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toUserRow(data)
  }
  const u = await db.user.create({
    data: {
      username: input.username,
      passwordHash: input.passwordHash,
      bio: "",
      avatarEmoji: input.avatarEmoji ?? "🎮",
      avatarColor: input.avatarColor ?? "#f97316",
    },
  })
  return toUserRow(u)
}

export async function updateUserProfile(
  id: string,
  patch: { bio?: string; avatarEmoji?: string; avatarColor?: string; avatarUrl?: string | null }
): Promise<void> {
  if ((await getMode()) === "supabase") {
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
    await sb().from("users").update(clean).eq("id", id)
    return
  }
  await db.user.update({ where: { id }, data: patch })
}

// ---------------------------- Favorites ----------------------------

export async function listFavoriteGames(userId: string): Promise<GameRow[]> {
  if ((await getMode()) === "supabase") {
    const { data: favs } = await sb().from("favorites").select("gameId").eq("userId", userId)
    const ids = (favs ?? []).map((f: any) => f.gameId)
    if (ids.length === 0) return []
    const { data: games } = await sb().from("games").select("*").in("id", ids)
    return (games as GameRow[]) ?? []
  }
  const favs = await db.favorite.findMany({ where: { userId } })
  const ids = favs.map((f) => f.gameId)
  if (ids.length === 0) return []
  const games = await db.game.findMany({ where: { id: { in: ids } } })
  return games.map((g) => ({ ...g, createdAt: iso(g.createdAt) }) as GameRow)
}

export async function isFavorite(userId: string, gameId: string): Promise<boolean> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb()
      .from("favorites")
      .select("id")
      .eq("userId", userId)
      .eq("gameId", gameId)
      .maybeSingle()
    return !!data
  }
  const f = await db.favorite.findFirst({ where: { userId, gameId } })
  return !!f
}

export async function toggleFavorite(userId: string, gameId: string): Promise<boolean> {
  const currently = await isFavorite(userId, gameId)
  if ((await getMode()) === "supabase") {
    if (currently) {
      await sb().from("favorites").delete().eq("userId", userId).eq("gameId", gameId)
    } else {
      await sb().from("favorites").insert({ userId, gameId })
    }
    return !currently
  }
  if (currently) {
    await db.favorite.deleteMany({ where: { userId, gameId } })
  } else {
    await db.favorite.create({ data: { userId, gameId } })
  }
  return !currently
}

// ---------------------------- Playtime ----------------------------

export async function addPlaytime(userId: string, gameId: string, seconds: number): Promise<void> {
  const safe = Math.max(0, Math.min(600, Math.floor(seconds)))
  if (safe === 0) return
  if ((await getMode()) === "supabase") {
    const { data } = await sb()
      .from("playtime")
      .select("id, seconds")
      .eq("userId", userId)
      .eq("gameId", gameId)
      .maybeSingle()
    if (data) {
      await sb().from("playtime").update({ seconds: data.seconds + safe }).eq("id", data.id)
    } else {
      await sb().from("playtime").insert({ userId, gameId, seconds: safe })
    }
    return
  }
  const existing = await db.playtime.findFirst({ where: { userId, gameId } })
  if (existing) {
    await db.playtime.update({ where: { id: existing.id }, data: { seconds: existing.seconds + safe } })
  } else {
    await db.playtime.create({ data: { userId, gameId, seconds: safe } })
  }
}

export async function listPlaytime(userId: string): Promise<PlaytimeRow[]> {
  if ((await getMode()) === "supabase") {
    const { data } = await sb().from("playtime").select("gameId, seconds").eq("userId", userId)
    return ((data ?? []) as any[]).map((r) => ({ gameId: r.gameId, seconds: r.seconds }))
  }
  const rows = await db.playtime.findMany({ where: { userId } })
  return rows.map((r) => ({ gameId: r.gameId, seconds: r.seconds }))
}
