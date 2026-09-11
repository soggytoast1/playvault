import { NextRequest, NextResponse } from "next/server"
import { addPlaytime } from "@/lib/store"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "user") {
    return NextResponse.json({ ok: true, tracked: false })
  }
  try {
    const body = await req.json()
    const gameId = String(body.gameId || "")
    const seconds = Number(body.seconds || 0)
    if (!gameId || !Number.isFinite(seconds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    await addPlaytime(session.id, gameId, seconds)
    return NextResponse.json({ ok: true, tracked: true })
  } catch (e) {
    console.error("playtime failed", e)
    return NextResponse.json({ error: "Failed to record playtime" }, { status: 500 })
  }
}
