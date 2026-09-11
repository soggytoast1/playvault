import { NextRequest, NextResponse } from "next/server"
import { createSuggestion, listSuggestions } from "@/lib/store"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const suggestions = await listSuggestions()
    return NextResponse.json({ suggestions })
  } catch (e) {
    console.error("list suggestions failed", e)
    return NextResponse.json({ error: "Failed to list suggestions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const gameTitle = String(body.gameTitle || "").trim()
    if (!gameTitle) {
      return NextResponse.json({ error: "Game title is required" }, { status: 400 })
    }
    const url = String(body.url || "").trim()
    if (url && !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 })
    }
    const suggestion = await createSuggestion({ gameTitle, url, note: String(body.note || "") })
    return NextResponse.json({ suggestion })
  } catch (e) {
    console.error("create suggestion failed", e)
    return NextResponse.json({ error: "Failed to submit suggestion" }, { status: 500 })
  }
}
