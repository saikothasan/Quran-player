"use client"

import { Moon, Sun } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">Professional Quran Player</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="rounded-full bg-emerald-200 p-2 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
        >
          {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </header>
  )
}

