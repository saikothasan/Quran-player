import Header from "@/components/header"
import QuranPlayer from "@/components/quran-player"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      <Suspense fallback={<div className="text-center">Loading Quran Player...</div>}>
        <QuranPlayer />
      </Suspense>
    </main>
  )
}

