import { NextRequest, NextResponse } from "next/server"
import { checkAdminCredentials, createSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body.username || "").trim()
    const password = String(body.password || "")
    if (!checkAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }
    await createSession({ id: "admin", username: "admin", role: "admin", avatarEmoji: "🛡️", avatarColor: "#f97316" })
    return NextResponse.json({ user: { username: "admin", role: "admin" } })
  } catch (e) {
    console.error("admin login failed", e)
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 })
  }
}
