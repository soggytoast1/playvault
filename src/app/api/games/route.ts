import { NextRequest, NextResponse } from "next/server"
import { createGame, listGames } from "@/lib/store"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const games = await listGames()
    return NextResponse.json({ games })
  } catch (e) {
    console.error("list games failed", e)
    return NextResponse.json({ error: "Failed to list games" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const body = await req.json()
    const title = String(body.title || "").trim()
    const embedUrl = String(body.embedUrl || "").trim()
    if (!title || !embedUrl) {
      return NextResponse.json({ error: "Title and embed URL are required" }, { status: 400 })
    }
    if (!/^https?:\/\//i.test(embedUrl)) {
      return NextResponse.json({ error: "Embed URL must start with http:// or https://" }, { status: 400 })
    }
    const slug =
      String(body.slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || `game-${Date.now()}`
    const game = await createGame({
      slug,
      title,
      description: String(body.description || ""),
      category: String(body.category || "Arcade"),
      embedUrl,
      thumbUrl: body.thumbUrl ? String(body.thumbUrl) : null,
      emoji: String(body.emoji || "🎮").slice(0, 4),
      featured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder) || 100,
    })
    return NextResponse.json({ game })
  } catch (e) {
    console.error("create game failed", e)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}
