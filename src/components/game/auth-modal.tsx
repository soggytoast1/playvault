"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { toast } from "sonner"

type Props = {
  open: boolean
  onClose: () => void
  onLoggedIn: (user: { id: string; username: string; role: "user" | "admin" }) => void
}

export function AuthModal({ open, onClose, onLoggedIn }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }
      toast.success(mode === "login" ? `Welcome back, ${data.user.username}!` : `Account created — welcome, ${data.user.username}!`)
      onLoggedIn(data.user)
      onClose()
      setUsername("")
      setPassword("")
    } catch {
      toast.error("Network error — try again")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong rounded-3xl border-border/40 sm:max-w-sm">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
          </DialogHeader>

          <div className="glass-chip mx-auto mt-3 flex rounded-full p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              className="rounded-xl"
            />
            <Input
              type="password"
              placeholder={mode === "register" ? "Password (6+ characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              className="rounded-xl"
            />
            <Button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {mode === "login" ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Accounts let you save favorites and track playtime.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
