import { NextRequest, NextResponse } from "next/server"
import { updateGame, deleteGame } from "@/lib/store"
import { isAdmin } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const patch: Record<string, unknown> = {}
    if (body.title !== undefined) patch.title = String(body.title).trim()
    if (body.description !== undefined) patch.description = String(body.description)
    if (body.category !== undefined) patch.category = String(body.category)
    if (body.embedUrl !== undefined) {
      const url = String(body.embedUrl).trim()
      if (!/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: "Embed URL must start with http:// or https://" }, { status: 400 })
      }
      patch.embedUrl = url
    }
    if (body.thumbUrl !== undefined) patch.thumbUrl = body.thumbUrl ? String(body.thumbUrl) : null
    if (body.emoji !== undefined) patch.emoji = String(body.emoji).slice(0, 4)
    if (body.featured !== undefined) patch.featured = Boolean(body.featured)
    if (body.sortOrder !== undefined) patch.sortOrder = Number(body.sortOrder) || 100
    if (body.active !== undefined) patch.active = Boolean(body.active)
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    }
    await updateGame(id, patch)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("update game failed", e)
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const { id } = await ctx.params
    await deleteGame(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("delete game failed", e)
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 })
  }
}
