import { NextRequest, NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/store"
import { createSession, verifyPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body.username || "").trim()
    const password = String(body.password || "")
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }
    const user = await getUserByUsername(username)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }
    await createSession({
      id: user.id,
      username: user.username,
      role: "user",
      avatarEmoji: user.avatarEmoji,
      avatarColor: user.avatarColor,
    })
    return NextResponse.json({ user: { id: user.id, username: user.username, role: "user" } })
  } catch (e) {
    console.error("login failed", e)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
