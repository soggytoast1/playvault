import { NextRequest, NextResponse } from "next/server"
import { updateSuggestionStatus } from "@/lib/store"
import { isAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const status = String(body.status || "")
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    await updateSuggestionStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("update suggestion failed", e)
    return NextResponse.json({ error: "Failed to update suggestion" }, { status: 500 })
  }
}
