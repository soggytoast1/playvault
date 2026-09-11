import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PlayVault — Unblocked Games Arcade",
  description:
    "The unblocked arcade: 58+ real browser games — Eaglercraft, Krunker, PolyTrack, Zombs Royale and more. Instant play, no downloads. Accounts, favorites and playtime tracking.",
  keywords: ["unblocked games", "browser games", "Eaglercraft", "Krunker", "PolyTrack", "PlayVault"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "PlayVault — Unblocked Games Arcade",
    description: "58+ real browser games. Instant play, zero limits.",
    siteName: "PlayVault",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <Sonner position="top-center" />
      </body>
    </html>
  )
}
