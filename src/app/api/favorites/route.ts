import { NextRequest, NextResponse } from "next/server"
import { listFavoriteGames, toggleFavorite } from "@/lib/store"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "user") {
    return NextResponse.json({ favorites: [] })
  }
  const favorites = await listFavoriteGames(session.id)
  return NextResponse.json({ favorites })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Login to save favorites" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const gameId = String(body.gameId || "")
    if (!gameId) return NextResponse.json({ error: "gameId required" }, { status: 400 })
    const isFav = await toggleFavorite(session.id, gameId)
    return NextResponse.json({ isFavorite: isFav })
  } catch (e) {
    console.error("favorite toggle failed", e)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
