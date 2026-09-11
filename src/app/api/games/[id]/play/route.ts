import { NextRequest, NextResponse } from "next/server"
import { incrementPlays } from "@/lib/store"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    await incrementPlays(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("increment plays failed", e)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
