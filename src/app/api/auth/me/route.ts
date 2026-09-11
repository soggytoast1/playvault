import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { listFavoriteGames, listPlaytime } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "user") {
    return NextResponse.json({ user: session, favorites: [], playtime: [] })
  }
  try {
    const [favorites, playtime] = await Promise.all([listFavoriteGames(session.id), listPlaytime(session.id)])
    return NextResponse.json({ user: session, favorites, playtime })
  } catch (e) {
    console.error("me failed", e)
    return NextResponse.json({ user: session, favorites: [], playtime: [] })
  }
}
