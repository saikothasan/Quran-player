import type { Metadata } from "next"
import { Noto_Sans_Arabic } from "next/font/google"
import "./globals.css"
import type React from "react"

const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"] })

export const metadata: Metadata = {
  title: "Professional Quran Player",
  description: "Listen to high-quality Quran recitations with an elegant interface",
  keywords: ["Quran", "Islam", "Recitation", "Audio Player"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={notoSansArabic.className}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950">
          {children}
        </div>
      </body>
    </html>
  )
}

