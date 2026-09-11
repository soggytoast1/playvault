"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Lightbulb, Send } from "lucide-react"
import { toast } from "sonner"

type Props = {
  open: boolean
  onClose: () => void
  presetTitle?: string
  presetUrl?: string
  fixMode?: boolean
}

export function SuggestModal({ open, onClose, presetTitle = "", presetUrl = "", fixMode }: Props) {
  const [gameTitle, setGameTitle] = useState(presetTitle)
  const [url, setUrl] = useState(presetUrl)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  // reset fields when reopened with a preset
  const [lastPreset, setLastPreset] = useState("")
  if (open && presetTitle !== lastPreset) {
    setLastPreset(presetTitle)
    setGameTitle(presetTitle)
    setUrl(presetUrl)
    setNote("")
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameTitle, url, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit")
        return
      }
      toast.success(fixMode ? "Thanks — the admins will check this game" : "Suggestion sent — admins will review it soon!")
      onClose()
      setGameTitle("")
      setUrl("")
      setNote("")
    } catch {
      toast.error("Network error — try again")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {fixMode ? "Report a broken game" : "Suggest a game"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            placeholder="Game title"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            required
            maxLength={120}
            className="rounded-xl"
          />
          <Input
            placeholder="Game URL (https://…) — optional for suggestions"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            maxLength={500}
            className="rounded-xl"
          />
          <Textarea
            placeholder={fixMode ? "What's wrong? (won't load, stuck, etc.)" : "Anything the admins should know?"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="min-h-[80px] rounded-xl"
          />
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            {busy ? "Sending…" : fixMode ? "Send report" : "Send suggestion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
