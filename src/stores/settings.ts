"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UiSettings = {
  liquidGlass: boolean
  compactCards: boolean
  showPlays: boolean
  animations: boolean
}

type SettingsState = UiSettings & {
  set: (patch: Partial<UiSettings>) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      liquidGlass: true,
      compactCards: false,
      showPlays: true,
      animations: true,
      set: (patch) => set(patch),
    }),
    { name: "playvault-settings" }
  )
)

/** Apply setting classes to <html>. Call on mount and on change. */
export function applySettingClasses(s: UiSettings) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("no-glass", !s.liquidGlass)
  document.documentElement.classList.toggle("no-anim", !s.animations)
}
