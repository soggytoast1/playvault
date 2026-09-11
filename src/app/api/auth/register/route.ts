import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByUsername } from "@/lib/store"
import { createSession, hashPassword } from "@/lib/auth"

const EMOJI_CHOICES = ["🎮", "🚀", "🐉", "👾", "🔥", "⚡", "🌟", "🦊", "🐸", "🦄", "🐺", "🎯"]
const COLOR_CHOICES = ["#f97316", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#14b8a6", "#f43f5e"]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body.username || "").trim()
    const password = String(body.password || "")

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters: letters, numbers, underscores only" },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await getUserByUsername(username)
    if (existing) {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 })
    }

    const avatarEmoji = EMOJI_CHOICES[Math.floor(Math.random() * EMOJI_CHOICES.length)]
    const avatarColor = COLOR_CHOICES[Math.floor(Math.random() * COLOR_CHOICES.length)]
    const user = await createUser({ username, passwordHash: await hashPassword(password), avatarEmoji, avatarColor })

    await createSession({ id: user.id, username: user.username, role: "user", avatarEmoji: user.avatarEmoji, avatarColor: user.avatarColor })
    return NextResponse.json({ user: { id: user.id, username: user.username, role: "user" } })
  } catch (e) {
    console.error("register failed", e)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
