import { NextRequest, NextResponse } from "next/server"
import { updateUserProfile } from "@/lib/store"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "user") {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const patch: { bio?: string; avatarEmoji?: string; avatarColor?: string; avatarUrl?: string | null } = {}
    if (body.bio !== undefined) patch.bio = String(body.bio).slice(0, 300)
    if (body.avatarEmoji !== undefined) patch.avatarEmoji = String(body.avatarEmoji).slice(0, 4)
    if (body.avatarColor !== undefined) patch.avatarColor = String(body.avatarColor).slice(0, 20)
    if (body.avatarUrl !== undefined) {
      const url = String(body.avatarUrl || "").trim()
      if (url && !/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: "Avatar URL must start with http:// or https://" }, { status: 400 })
      }
      patch.avatarUrl = url || null
    }
    await updateUserProfile(session.id, patch)
    // refresh session avatar
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("profile update failed", e)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
