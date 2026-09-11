"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Settings2, Sparkles, LayoutGrid, Eye, Zap } from "lucide-react"
import { useSettings, applySettingClasses } from "@/stores/settings"

type Props = {
  open: boolean
  onClose: () => void
}

const OPTIONS = [
  {
    key: "liquidGlass" as const,
    icon: Sparkles,
    title: "Liquid Glass",
    desc: "Frosted translucent panels (Apple-style). Turn off for solid dark UI and better performance on old devices.",
  },
  {
    key: "animations" as const,
    icon: Zap,
    title: "Animations",
    desc: "Motion and transition effects on cards and pages.",
  },
  {
    key: "compactCards" as const,
    icon: LayoutGrid,
    title: "Compact cards",
    desc: "Smaller game tiles — more games per screen.",
  },
  {
    key: "showPlays" as const,
    icon: Eye,
    title: "Show play counts",
    desc: "Display the total play count on each game card.",
  },
]

export function SettingsSheet({ open, onClose }: Props) {
  const settings = useSettings()

  useEffect(() => {
    applySettingClasses(settings)
  }, [settings])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {OPTIONS.map(({ key, icon: Icon, title, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-white/5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="glass-chip mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="h-4 w-4 text-foreground/80" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(v) => settings.set({ [key]: v })}
                aria-label={title}
              />
            </div>
          ))}
        </div>
        <p className="pt-1 text-center text-[11px] text-muted-foreground">Saved to this browser automatically.</p>
      </DialogContent>
    </Dialog>
  )
}
