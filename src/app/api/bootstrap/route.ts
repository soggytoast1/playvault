import { NextResponse } from "next/server"
import { ensureSeeded, getMode, listGames } from "@/lib/store"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    await ensureSeeded()
    const [games, session, mode] = await Promise.all([listGames(), getSession(), getMode()])
    return NextResponse.json({
      games,
      user: session,
      mode,
      adminEnabled: Boolean(process.env.ADMIN_PASSWORD),
    })
  } catch (e) {
    console.error("bootstrap failed", e)
    return NextResponse.json({ error: "Failed to load games" }, { status: 500 })
  }
}
