"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Bookmark, Share2, Target } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { fetchSurahs, fetchRecitations, fetchLanguages, fetchTranslations, fetchVerses } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import type { Surah, Recitation, Language, Translation, Verse, Bookmark, ReadingGoal } from "@/types/quran"
import { toast } from "@/components/ui/use-toast"

export default function QuranPlayer() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [recitations, setRecitations] = useState<Recitation[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null)
  const [currentRecitation, setCurrentRecitation] = useState<Recitation | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<Language>({ iso_code: "en", native_name: "English" })
  const [currentTranslation, setCurrentTranslation] = useState<Translation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [verses, setVerses] = useState<Verse[]>([])
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>({
    versesPerDay: 10,
    startDate: new Date().toISOString().split("T")[0],
    lastReadDate: new Date().toISOString().split("T")[0],
    totalVersesRead: 0,
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [surahsData, recitationsData, languagesData, translationsData] = await Promise.all([
          fetchSurahs(),
          fetchRecitations(),
          fetchLanguages(),
          fetchTranslations(),
        ])
        setSurahs(surahsData)
        setFilteredSurahs(surahsData)
        setRecitations(recitationsData)
        setLanguages(languagesData)
        setTranslations(translationsData)
        setCurrentSurah(surahsData[0] || null)
        setCurrentRecitation(recitationsData[0] || null)
        setCurrentTranslation(translationsData[0] || null)
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive",
        })
      }
    }
    loadData()
    loadBookmarks()
    loadReadingGoal()
  }, [])

  useEffect(() => {
    if (currentSurah && currentRecitation) {
      loadVerses()
    }
  }, [currentSurah, currentRecitation]) // Removed unnecessary dependency: currentTranslation

  useEffect(() => {
    async function updateSurahs() {
      try {
        const [surahsData, translationsData] = await Promise.all([
          fetchSurahs(currentLanguage.iso_code),
          fetchTranslations(currentLanguage.iso_code),
        ])
        setSurahs(surahsData)
        setFilteredSurahs(surahsData)
        setTranslations(translationsData)
        setCurrentSurah(surahsData[0] || null)
        setCurrentTranslation(translationsData[0] || null)
      } catch (error) {
        console.error("Error updating surahs and translations:", error)
        toast({
          title: "Error",
          description: "Failed to update surahs and translations. Please try again.",
          variant: "destructive",
        })
      }
    }
    updateSurahs()
  }, [currentLanguage])

  async function loadVerses() {
    try {
      if (currentSurah && currentTranslation) {
        const versesData = await fetchVerses(currentSurah.id, currentTranslation.id, currentLanguage.iso_code)
        setVerses(versesData)
        setCurrentVerse(versesData[0] || null)
      }
    } catch (error) {
      console.error("Error loading verses:", error)
      toast({
        title: "Error",
        description: "Failed to load verses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playPrevious = () => {
    if (currentVerse && verses.length > 0) {
      const currentIndex = verses.findIndex((verse) => verse.id === currentVerse.id)
      const previousIndex = (currentIndex - 1 + verses.length) % verses.length
      setCurrentVerse(verses[previousIndex])
    }
  }

  const playNext = () => {
    if (currentVerse && verses.length > 0) {
      const currentIndex = verses.findIndex((verse) => verse.id === currentVerse.id)
      const nextIndex = (currentIndex + 1) % verses.length
      setCurrentVerse(verses[nextIndex])
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0]
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase()
    setSearchTerm(searchTerm)
    const filtered = surahs.filter(
      (surah) =>
        surah.name_simple.toLowerCase().includes(searchTerm) ||
        surah.name_arabic.toLowerCase().includes(searchTerm) ||
        surah.translated_name.name.toLowerCase().includes(searchTerm),
    )
    setFilteredSurahs(filtered)
  }

  const toggleBookmark = () => {
    if (currentSurah && currentVerse) {
      const existingBookmark = bookmarks.find((b) => b.surahId === currentSurah.id && b.verseId === currentVerse.id)
      if (existingBookmark) {
        const updatedBookmarks = bookmarks.filter((b) => b !== existingBookmark)
        setBookmarks(updatedBookmarks)
        localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks))
        toast({
          title: "Bookmark Removed",
          description: `Removed bookmark for Surah ${currentSurah.name_simple}, Verse ${currentVerse.verse_key}`,
        })
      } else {
        const newBookmark: Bookmark = {
          surahId: currentSurah.id,
          verseId: currentVerse.id,
          timestamp: Date.now(),
        }
        const updatedBookmarks = [...bookmarks, newBookmark]
        setBookmarks(updatedBookmarks)
        localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks))
        toast({
          title: "Bookmark Added",
          description: `Added bookmark for Surah ${currentSurah.name_simple}, Verse ${currentVerse.verse_key}`,
        })
      }
    }
  }

  const loadBookmarks = () => {
    const savedBookmarks = localStorage.getItem("bookmarks")
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }

  const shareVerse = () => {
    if (currentSurah && currentVerse) {
      const shareText = `Quran ${currentVerse.verse_key}: ${currentVerse.translations[0].text}`
      if (navigator.share) {
        navigator
          .share({
            title: "Share Quran Verse",
            text: shareText,
            url: window.location.href,
          })
          .catch((error) => console.error("Error sharing:", error))
      } else {
        navigator.clipboard.writeText(shareText).then(
          () => {
            toast({
              title: "Copied to Clipboard",
              description: "The verse has been copied to your clipboard.",
            })
          },
          (err) => {
            console.error("Could not copy text: ", err)
          },
        )
      }
    }
  }

  const updateReadingGoal = (versesRead: number) => {
    const today = new Date().toISOString().split("T")[0]
    const updatedGoal = {
      ...readingGoal,
      lastReadDate: today,
      totalVersesRead: readingGoal.totalVersesRead + versesRead,
    }
    setReadingGoal(updatedGoal)
    localStorage.setItem("readingGoal", JSON.stringify(updatedGoal))

    if (updatedGoal.totalVersesRead >= updatedGoal.versesPerDay) {
      toast({
        title: "Goal Achieved!",
        description: `You've reached your daily reading goal of ${updatedGoal.versesPerDay} verses!`,
      })
    }
  }

  const loadReadingGoal = () => {
    const savedGoal = localStorage.getItem("readingGoal")
    if (savedGoal) {
      setReadingGoal(JSON.parse(savedGoal))
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">Quran Player</h1>
        <DarkModeToggle />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-emerald-800 dark:text-emerald-200">Surah List</h2>
          <div className="mb-4 space-y-2">
            <Select
              value={currentLanguage?.iso_code || ""}
              onValueChange={(value) => {
                const newLanguage = languages.find((lang) => lang.iso_code === value)
                if (newLanguage) {
                  setCurrentLanguage(newLanguage)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.iso_code} value={language.iso_code}>
                    {language.native_name} ({language.iso_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search surahs..."
                value={searchTerm}
                onChange={handleSearch}
                className="flex-grow"
              />
              <Button size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ul className="max-h-96 space-y-2 overflow-y-auto scrollbar-hide">
            {filteredSurahs.map((surah) => (
              <li key={surah.id}>
                <button
                  onClick={() => setCurrentSurah(surah)}
                  className={`w-full rounded-md px-4 py-2 text-left transition-colors ${
                    currentSurah && currentSurah.id === surah.id
                      ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                      : "hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  }`}
                >
                  {surah.name_simple} - {surah.name_arabic}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
              {currentSurah ? `${currentSurah.name_simple} - ${currentSurah.name_arabic}` : "Select a Surah"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRecitation ? `Reciter: ${currentRecitation.reciter_name}` : "Select a Reciter"}
            </p>
          </div>
          <div className="mb-4 space-y-2">
            <Select
              value={currentRecitation ? currentRecitation.id.toString() : ""}
              onValueChange={(value) => {
                const newRecitation = recitations.find((r) => r.id === Number.parseInt(value))
                if (newRecitation) {
                  setCurrentRecitation(newRecitation)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Reciter" />
              </SelectTrigger>
              <SelectContent>
                {recitations.map((recitation) => (
                  <SelectItem key={recitation.id} value={recitation.id.toString()}>
                    {recitation.reciter_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentTranslation ? currentTranslation.id.toString() : ""}
              onValueChange={(value) => {
                const newTranslation = translations.find((t) => t.id === Number.parseInt(value))
                if (newTranslation) {
                  setCurrentTranslation(newTranslation)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Translation" />
              </SelectTrigger>
              <SelectContent>
                {translations.map((translation) => (
                  <SelectItem key={translation.id} value={translation.id.toString()}>
                    {translation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={playPrevious} size="icon" variant="outline">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button onClick={togglePlay} size="icon" variant="default">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button onClick={playNext} size="icon" variant="outline">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={(value) => {
            if (audioRef.current) {
              audioRef.current.currentTime = value[0]
            }
            setCurrentTime(value[0])
          }}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(currentTime)}</span>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-emerald-800 dark:text-emerald-200" />
            <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentVerse?.audio.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
          }
        }}
      />
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold text-emerald-800 dark:text-emerald-200">Current Verse</h4>
        {currentVerse && (
          <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900 dark:text-emerald-100">
            <p className="text-lg font-semibold">{currentVerse.text_uthmani}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{currentVerse.translations[0]?.text}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={toggleBookmark} size="sm" variant="outline">
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmark
              </Button>
              <Button onClick={shareVerse} size="sm" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold text-emerald-800 dark:text-emerald-200">Reading Goal</h4>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Daily Goal: {readingGoal.versesPerDay} verses</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Progress: {readingGoal.totalVersesRead} / {readingGoal.versesPerDay}
          </p>
          <Button onClick={() => updateReadingGoal(1)} size="sm" variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Mark as Read
          </Button>
        </div>
      </div>
    </div>
  )
}

